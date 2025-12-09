/**
 * @fileoverview Fan chart component for displaying ancestor relationships in a circular layout
 * @author Gramps Web contributors
 */

import {html, css} from 'lit'

import {FanChart} from '../charts/FanChart.js'
import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {getPersonByGrampsId, getTree} from '../charts/util.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'

class GrampsjsFanChart extends GrampsjsChartBase {
  static get styles() {
    return [
      super.styles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        svg a {
          text-decoration: none !important;
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      depth: {type: Number},
      color: {type: String},
      nameDisplayFormat: {type: String},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.depth = 5
    this.color = ''
  }

  renderChart() {
    if (this.data.length === 0 || !this.grampsId) {
      return ''
    }
    const {handle} = getPersonByGrampsId(this.data, this.grampsId)
    if (!handle) {
      return ''
    }
    const data = getTree(this.data, handle, this.depth)
    const arcRadius = 60
    return html`
      ${FanChart(data, {
        depth: this.depth,
        arcRadius,
        color: this.color || 'default',
        bboxWidth: this.containerWidth,
        bboxHeight: this.containerHeight,
        nameDisplayFormat: this.nameDisplayFormat,
        strings: this.appState.i18n.strings,
      })}
    `
  }
}

window.customElements.define('grampsjs-fan-chart', GrampsjsFanChart)
