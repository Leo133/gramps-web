/**
 * @fileoverview High-Performance Fan Chart using PixiJS
 * @author Gramps Web contributors
 */
import * as PIXI from 'pixi.js'
import {GrampsjsPixiChart} from './GrampsjsPixiChart.js'

export class GrampsjsPixiFanChart extends GrampsjsPixiChart {
  static get properties() {
    return {
      ...super.properties,
      grampsId: {type: String},
      depth: {type: Number},
      color: {type: String},
      nameDisplayFormat: {type: String},
    }
  }

  constructor() {
    super()
    this.depth = 5
    this.color = ''
    this.nameDisplayFormat = 'firstLast'
  }

  async fetchData() {
    if (!this.grampsId) return

    try {
      const url = `/api/visualizations/fanchart/${this.grampsId}?depth=${this.depth}`
      const response = await fetch(url)
      if (response.ok) {
        this.data = await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch fan chart data:', error)
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('grampsId') || changedProperties.has('depth')) {
      this.fetchData()
    }
    super.updated(changedProperties)
  }

  renderChart(stage, data) {
    if (!data || !data.nodes) return

    const centerX = this.app.screen.width / 2
    const centerY = this.app.screen.height / 2
    const maxRadius = Math.min(centerX, centerY) - 20

    // Create container for the fan chart
    const container = new PIXI.Container()
    container.x = centerX
    container.y = centerY

    // Draw each generation as a ring
    data.nodes.forEach(node => {
      const generation = node.generation || 0
      const innerRadius = (generation / this.depth) * maxRadius
      const outerRadius = ((generation + 1) / this.depth) * maxRadius
      
      // Calculate angles for this person's sector
      const angleStart = (node.angleStart || 0) * Math.PI / 180
      const angleEnd = (node.angleEnd || 0) * Math.PI / 180
      
      // Create the wedge
      const wedge = this._createWedge(
        innerRadius,
        outerRadius,
        angleStart,
        angleEnd,
        this._getColorForNode(node)
      )
      
      // Add interactive behavior
      wedge.interactive = true
      wedge.buttonMode = true
      wedge.on('click', () => this._handleNodeClick(node))
      wedge.on('mouseover', () => this._handleNodeHover(wedge, true))
      wedge.on('mouseout', () => this._handleNodeHover(wedge, false))
      
      container.addChild(wedge)
      
      // Add text label if there's enough space
      if (outerRadius - innerRadius > 20 && angleEnd - angleStart > 0.1) {
        const text = this._createTextLabel(
          node.name || '?',
          (innerRadius + outerRadius) / 2,
          (angleStart + angleEnd) / 2
        )
        container.addChild(text)
      }
    })

    // Add center point
    const center = new PIXI.Graphics()
    center.beginFill(0x333333)
    center.drawCircle(0, 0, 5)
    center.endFill()
    container.addChild(center)

    stage.addChild(container)
    
    // Enable zoom and pan
    this._enableInteraction(container)
  }

  _createWedge(innerRadius, outerRadius, angleStart, angleEnd, color) {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(color)
    graphics.lineStyle(1, 0xFFFFFF, 0.5)
    
    // Draw the wedge using arc
    const steps = 32
    const angleStep = (angleEnd - angleStart) / steps
    
    graphics.moveTo(
      innerRadius * Math.cos(angleStart),
      innerRadius * Math.sin(angleStart)
    )
    
    // Outer arc
    for (let i = 0; i <= steps; i++) {
      const angle = angleStart + i * angleStep
      graphics.lineTo(
        outerRadius * Math.cos(angle),
        outerRadius * Math.sin(angle)
      )
    }
    
    // Inner arc (reverse)
    for (let i = steps; i >= 0; i--) {
      const angle = angleStart + i * angleStep
      graphics.lineTo(
        innerRadius * Math.cos(angle),
        innerRadius * Math.sin(angle)
      )
    }
    
    graphics.closePath()
    graphics.endFill()
    
    return graphics
  }

  _createTextLabel(text, radius, angle) {
    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0x000000,
      align: 'center',
    })
    
    label.anchor.set(0.5)
    label.x = radius * Math.cos(angle)
    label.y = radius * Math.sin(angle)
    label.rotation = angle + Math.PI / 2
    
    return label
  }

  _getColorForNode(node) {
    // Default color scheme
    if (this.color === 'gender') {
      if (node.gender === 'M') return 0x87CEEB // Sky blue for male
      if (node.gender === 'F') return 0xFFB6C1 // Light pink for female
      return 0xDDDDDD // Gray for unknown
    }
    
    // Generation-based coloring
    const hue = ((node.generation || 0) / this.depth) * 360
    return this._hslToRgb(hue, 70, 70)
  }

  _hslToRgb(h, s, l) {
    s /= 100
    l /= 100
    
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    
    let r, g, b
    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]
    
    return ((r + m) * 255 << 16) + ((g + m) * 255 << 8) + (b + m) * 255
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

  _handleNodeHover(wedge, isHover) {
    wedge.alpha = isHover ? 0.8 : 1.0
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

customElements.define('grampsjs-pixi-fan-chart', GrampsjsPixiFanChart)
