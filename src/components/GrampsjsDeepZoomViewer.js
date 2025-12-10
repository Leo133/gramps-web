/**
 * @fileoverview Deep Zoom Viewer component using OpenSeadragon
 * @author Gramps Web contributors
 */
import {LitElement, html, css} from 'lit'
import OpenSeadragon from 'openseadragon'
import {designTokens} from '../design-tokens.js'

export class GrampsjsDeepZoomViewer extends LitElement {
  static get styles() {
    return [
      designTokens,
      css`
        :host {
          display: block;
          width: 100%;
          height: 600px;
          position: relative;
          background-color: var(--grampsjs-color-surface-variant);
        }

        #openseadragon-viewer {
          width: 100%;
          height: 100%;
        }

        .controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
      `,
    ]
  }

  static get properties() {
    return {
      tileSources: {type: Object},
      viewerId: {type: String},
    }
  }

  constructor() {
    super()
    this.viewerId = `osd-${Math.random().toString(36).substr(2, 9)}`
    this.viewer = null
  }

  firstUpdated() {
    this.initViewer()
  }

  updated(changedProperties) {
    if (changedProperties.has('tileSources') && this.viewer) {
      this.viewer.open(this.tileSources)
    }
  }

  initViewer() {
    const element = this.shadowRoot.getElementById('openseadragon-viewer')
    if (!element) return

    // OpenSeadragon needs an ID to attach to, but inside Shadow DOM it's tricky.
    // However, passing the element directly works in newer versions.

    this.viewer = OpenSeadragon({
      element,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/', // Fallback or local assets
      tileSources: this.tileSources,
      showNavigator: true,
      showRotationControl: true,
      gestureSettingsMouse: {
        clickToZoom: false,
      },
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.viewer) {
      this.viewer.destroy()
      this.viewer = null
    }
  }

  render() {
    return html` <div id="openseadragon-viewer"></div> `
  }
}

customElements.define('grampsjs-deep-zoom-viewer', GrampsjsDeepZoomViewer)
