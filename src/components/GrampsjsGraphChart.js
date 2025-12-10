import {html, css, LitElement} from 'lit'
import * as d3 from 'd3'

export class GrampsjsGraphChart extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      svg {
        width: 100%;
        height: 100%;
        background: var(--grampsjs-card-background);
      }

      .node circle {
        stroke: #fff;
        stroke-width: 2px;
        cursor: pointer;
      }

      .node text {
        font-size: 12px;
        pointer-events: none;
        text-anchor: middle;
      }

      .link {
        stroke: var(--grampsjs-body-font-color-30);
        stroke-opacity: 0.6;
      }

      .link.parent {
        stroke-width: 2px;
      }

      .link.spouse {
        stroke-width: 1.5px;
        stroke-dasharray: 5, 5;
      }

      .node.male circle {
        fill: #4a90e2;
      }

      .node.female circle {
        fill: #e24a90;
      }

      .node.unknown circle {
        fill: #999;
      }
    `
  }

  static get properties() {
    return {
      data: {type: Object},
      appState: {type: Object},
    }
  }

  constructor() {
    super()
    this.data = null
    this.appState = {}
  }

  updated(changedProperties) {
    if (changedProperties.has('data') && this.data) {
      this._renderGraph()
    }
  }

  _renderGraph() {
    const container = this.shadowRoot.querySelector('#chart')
    if (!container) return

    // Clear previous content
    container.innerHTML = ''

    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')

    // Zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Create force simulation
    const simulation = d3
      .forceSimulation(this.data.nodes)
      .force(
        'link',
        d3
          .forceLink(this.data.links)
          .id(d => d.id)
          .distance(d => (d.type === 'spouse' ? 80 : 120)),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(this.data.links)
      .join('line')
      .attr('class', d => `link ${d.type}`)

    // Create nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(this.data.nodes)
      .join('g')
      .attr('class', d => {
        const gender =
          d.gender === 0 ? 'female' : d.gender === 1 ? 'male' : 'unknown'
        return `node ${gender}`
      })
      .call(
        d3
          .drag()
          .on('start', event => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
          })
          .on('drag', event => {
            event.subject.fx = event.x
            event.subject.fy = event.y
          })
          .on('end', event => {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
          }),
      )

    node.append('circle').attr('r', 8)

    node.append('text').attr('dy', 20).text(d => d.name)

    // Add click handler
    node.on('click', (event, d) => {
      window.location.href = `#/person/${d.grampsId}`
    })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })
  }

  render() {
    return html` <div id="chart"></div> `
  }
}

window.customElements.define('grampsjs-graph-chart', GrampsjsGraphChart)
