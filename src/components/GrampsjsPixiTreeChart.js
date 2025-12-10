/**
 * @fileoverview High-Performance Tree Chart using PixiJS
 * @author Gramps Web contributors
 */
import * as PIXI from 'pixi.js'
import {GrampsjsPixiChart} from './GrampsjsPixiChart.js'

export class GrampsjsPixiTreeChart extends GrampsjsPixiChart {
  static get properties() {
    return {
      ...super.properties,
      grampsId: {type: String},
      nAnc: {type: Number},
      nDesc: {type: Number},
      nameDisplayFormat: {type: String},
    }
  }

  constructor() {
    super()
    this.nAnc = 3
    this.nDesc = 1
    this.nameDisplayFormat = 'firstLast'
  }

  async fetchData() {
    if (!this.grampsId) return

    try {
      const url = `/api/visualizations/treechart/${this.grampsId}?ancestors=${this.nAnc}&descendants=${this.nDesc}`
      const response = await fetch(url)
      if (response.ok) {
        this.data = await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch tree chart data:', error)
    }
  }

  updated(changedProperties) {
    if (
      changedProperties.has('grampsId') ||
      changedProperties.has('nAnc') ||
      changedProperties.has('nDesc')
    ) {
      this.fetchData()
    }
    super.updated(changedProperties)
  }

  renderChart(stage, data) {
    if (!data || !data.nodes) return

    const nodeWidth = 100
    const nodeHeight = 40
    const horizontalSpacing = 120
    const verticalSpacing = 60

    // Create container for the tree
    const container = new PIXI.Container()
    container.x = this.app.screen.width / 2
    container.y = 50

    // Build node positions using a simple tree layout
    const nodePositions = this._calculateNodePositions(
      data.nodes,
      nodeWidth,
      nodeHeight,
      horizontalSpacing,
      verticalSpacing
    )

    // Draw connections first (so they appear behind nodes)
    data.edges?.forEach(edge => {
      const sourcePos = nodePositions.get(edge.source)
      const targetPos = nodePositions.get(edge.target)
      if (sourcePos && targetPos) {
        const line = this._createConnection(sourcePos, targetPos)
        container.addChild(line)
      }
    })

    // Draw nodes
    data.nodes.forEach(node => {
      const pos = nodePositions.get(node.id)
      if (pos) {
        const nodeGraphic = this._createNode(
          node,
          pos.x,
          pos.y,
          nodeWidth,
          nodeHeight
        )
        container.addChild(nodeGraphic)
      }
    })

    stage.addChild(container)
    
    // Enable zoom and pan
    this._enableInteraction(container)
  }

  _calculateNodePositions(nodes, nodeWidth, nodeHeight, hSpacing, vSpacing) {
    const positions = new Map()
    
    // Simple layout: arrange by generation
    const nodesByGeneration = new Map()
    
    nodes.forEach(node => {
      const gen = node.generation || 0
      if (!nodesByGeneration.has(gen)) {
        nodesByGeneration.set(gen, [])
      }
      nodesByGeneration.get(gen).push(node)
    })
    
    // Position nodes
    nodesByGeneration.forEach((nodesInGen, gen) => {
      const totalWidth = nodesInGen.length * (nodeWidth + hSpacing) - hSpacing
      const startX = -totalWidth / 2
      
      nodesInGen.forEach((node, index) => {
        positions.set(node.id, {
          x: startX + index * (nodeWidth + hSpacing),
          y: gen * (nodeHeight + vSpacing),
        })
      })
    })
    
    return positions
  }

  _createNode(node, x, y, width, height) {
    const container = new PIXI.Container()
    container.x = x
    container.y = y

    // Background
    const background = new PIXI.Graphics()
    const color = this._getColorForNode(node)
    background.beginFill(color)
    background.lineStyle(2, 0x333333, 1)
    background.drawRoundedRect(-width / 2, -height / 2, width, height, 5)
    background.endFill()
    
    // Make interactive
    background.interactive = true
    background.buttonMode = true
    background.on('click', () => this._handleNodeClick(node))
    background.on('mouseover', () => this._handleNodeHover(background, true))
    background.on('mouseout', () => this._handleNodeHover(background, false))
    
    container.addChild(background)

    // Name text
    const name = node.name || '?'
    const text = new PIXI.Text(this._truncateText(name, width - 10), {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x000000,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: width - 10,
    })
    text.anchor.set(0.5)
    container.addChild(text)

    // Birth/Death years
    if (node.birth || node.death) {
      const years = `${node.birth || '?'} - ${node.death || '?'}`
      const datesText = new PIXI.Text(years, {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x666666,
        align: 'center',
      })
      datesText.anchor.set(0.5)
      datesText.y = 12
      container.addChild(datesText)
    }

    return container
  }

  _createConnection(sourcePos, targetPos) {
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(2, 0x999999, 1)
    
    // Draw line from source to target
    graphics.moveTo(sourcePos.x, sourcePos.y + 20) // Bottom of source node
    graphics.lineTo(targetPos.x, targetPos.y - 20) // Top of target node
    
    return graphics
  }

  _getColorForNode(node) {
    if (node.gender === 'M') return 0xB0E0E6 // Powder blue for male
    if (node.gender === 'F') return 0xFFDAE0 // Pale pink for female
    return 0xE0E0E0 // Light gray for unknown
  }

  _truncateText(text, maxWidth) {
    if (text.length * 7 > maxWidth) {
      const maxChars = Math.floor(maxWidth / 7) - 3
      return text.substring(0, maxChars) + '...'
    }
    return text
  }

  _handleNodeClick(node) {
    this.dispatchEvent(
      new CustomEvent('node:click', {
        detail: {grampsId: node.grampsId, handle: node.handle},
        bubbles: true,
        composed: true,
      })
    )
  }

  _handleNodeHover(nodeGraphic, isHover) {
    nodeGraphic.alpha = isHover ? 0.8 : 1.0
  }

  _enableInteraction(container) {
    let isDragging = false
    let dragStart = {x: 0, y: 0}
    let lastScale = 1
    
    this.app.stage.interactive = true
    this.app.stage.on('pointerdown', e => {
      isDragging = true
      dragStart = {x: e.data.global.x - container.x, y: e.data.global.y - container.y}
    })
    
    this.app.stage.on('pointermove', e => {
      if (isDragging) {
        container.x = e.data.global.x - dragStart.x
        container.y = e.data.global.y - dragStart.y
      }
    })
    
    this.app.stage.on('pointerup', () => {
      isDragging = false
    })
    
    // Zoom with mouse wheel
    this.app.view.addEventListener('wheel', e => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 1.1 : 0.9
      lastScale *= delta
      container.scale.set(lastScale)
    })
  }
}

customElements.define('grampsjs-pixi-tree-chart', GrampsjsPixiTreeChart)
