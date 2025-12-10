/**
 * @fileoverview Base component for High-Performance Charts using PixiJS
 * @author Gramps Web contributors
 */
import {LitElement, html, css} from 'lit'
import * as PIXI from 'pixi.js'
import {designTokens} from '../design-tokens.js'

export class GrampsjsPixiChart extends LitElement {
  static get styles() {
    return [
      designTokens,
      css`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      `,
    ]
  }

  static get properties() {
    return {
      data: {type: Object},
      width: {type: Number},
      height: {type: Number},
    }
  }

  constructor() {
    super()
    this.app = null
    this.width = 800
    this.height = 600
  }

  firstUpdated() {
    this.initPixi()
  }

  async initPixi() {
    const container = this.shadowRoot.getElementById('chart-container')

    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor: 0xffffff,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    })

    container.appendChild(this.app.view)

    // Handle resize
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect
        this.app.renderer.resize(width, height)
        this.drawChart()
      }
    })
    this.resizeObserver.observe(this)
  }

  updated(changedProperties) {
    if (changedProperties.has('data') && this.app) {
      this.drawChart()
    }
  }

  drawChart() {
    if (!this.app || !this.data) return

    // Clear stage
    this.app.stage.removeChildren()

    // To be implemented by subclasses
    this.renderChart(this.app.stage, this.data)
  }

  renderChart(stage) {
    // Placeholder implementation
    const text = new PIXI.Text('Chart Data Loaded', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x000000,
    })
    text.x = this.app.screen.width / 2
    text.y = this.app.screen.height / 2
    text.anchor.set(0.5)
    stage.addChild(text)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.app) {
      this.app.destroy(true, {children: true, texture: true, baseTexture: true})
      this.app = null
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  render() {
    return html`<div
      id="chart-container"
      style="width: 100%; height: 100%;"
    ></div>`
  }
}

customElements.define('grampsjs-pixi-chart', GrampsjsPixiChart)
