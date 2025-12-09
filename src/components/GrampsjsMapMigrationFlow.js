import {LitElement} from 'lit'

class GrampsjsMapMigrationFlow extends LitElement {
  static get properties() {
    return {
      flows: {type: Array},
      visible: {type: Boolean},
      animated: {type: Boolean},
      _map: {type: Object, attribute: false},
    }
  }

  constructor() {
    super()
    this.flows = []
    this.visible = true
    this.animated = true
    this._sourceId = 'migration-flows'
    this._layerId = 'migration-flows-layer'
  }

  firstUpdated() {
    this._map = this.parentElement._map
    if (this._map) {
      this._map.on('load', () => {
        this.addFlowsToMap()
      })
      if (this._map.isStyleLoaded()) {
        this.addFlowsToMap()
      }
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('flows') || changedProperties.has('visible')) {
      this.updateFlows()
    }
  }

  addFlowsToMap() {
    if (!this._map || !this._map.isStyleLoaded()) return

    // Remove existing source/layer if present
    if (this._map.getLayer(this._layerId)) {
      this._map.removeLayer(this._layerId)
    }
    if (this._map.getSource(this._sourceId)) {
      this._map.removeSource(this._sourceId)
    }

    // Create GeoJSON from flows
    const geojson = this.createGeoJSON()

    // Add source
    this._map.addSource(this._sourceId, {
      type: 'geojson',
      data: geojson,
    })

    // Add curved line layer
    this._map.addLayer({
      id: this._layerId,
      type: 'line',
      source: this._sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'sequence'],
          0,
          '#3b82f6', // blue
          1,
          '#8b5cf6', // purple
          2,
          '#ec4899', // pink
          3,
          '#f59e0b', // amber
        ],
        'line-width': 3,
        'line-opacity': 0.8,
      },
    })

    // Add arrow heads layer
    this._map.addLayer({
      id: `${this._layerId}-arrows`,
      type: 'symbol',
      source: this._sourceId,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 100,
        'icon-image': 'arrow',
        'icon-size': 0.5,
        'icon-allow-overlap': true,
      },
    })
  }

  createGeoJSON() {
    const features = []

    // eslint-disable-next-line no-restricted-syntax
    for (const flow of this.flows) {
      if (!flow.path || flow.path.length < 2) {
        // eslint-disable-next-line no-continue
        continue
      }

      // Create line segments between consecutive events
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < flow.path.length - 1; i++) {
        const start = flow.path[i]
        const end = flow.path[i + 1]

        // Create a curved path using a simple bezier approach
        const curved = this.createCurvedPath(start, end)

        features.push({
          type: 'Feature',
          properties: {
            personHandle: flow.personHandle,
            personName: flow.personName,
            sequence: i,
            from: flow.events[i]?.placeName || '',
            to: flow.events[i + 1]?.placeName || '',
          },
          geometry: {
            type: 'LineString',
            coordinates: curved,
          },
        })
      }
    }

    return {
      type: 'FeatureCollection',
      features,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  createCurvedPath(start, end) {
    // Create a curved path using intermediate points
    // start and end are [latitude, longitude]
    const [lat1, lng1] = start
    const [lat2, lng2] = end

    // Calculate control point for bezier curve
    // Offset perpendicular to the line
    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2

    // Calculate perpendicular offset
    const angle = Math.atan2(lat2 - lat1, lng2 - lng1)
    const offset = Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) * 0.2
    const controlLat = midLat + offset * Math.sin(angle + Math.PI / 2)
    const controlLng = midLng + offset * Math.cos(angle + Math.PI / 2)

    // Generate points along the curve
    const points = []
    const steps = 20
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const lat =
        (1 - t) ** 2 * lat1 + 2 * (1 - t) * t * controlLat + t ** 2 * lat2
      const lng =
        (1 - t) ** 2 * lng1 + 2 * (1 - t) * t * controlLng + t ** 2 * lng2
      // MapLibre uses [lng, lat] order
      points.push([lng, lat])
    }

    return points
  }

  updateFlows() {
    if (!this._map || !this._map.getSource(this._sourceId)) return

    const geojson = this.createGeoJSON()
    this._map.getSource(this._sourceId).setData(geojson)

    // Toggle visibility
    const visibility = this.visible ? 'visible' : 'none'
    if (this._map.getLayer(this._layerId)) {
      this._map.setLayoutProperty(this._layerId, 'visibility', visibility)
    }
    if (this._map.getLayer(`${this._layerId}-arrows`)) {
      this._map.setLayoutProperty(
        `${this._layerId}-arrows`,
        'visibility',
        visibility
      )
    }
  }

  disconnectedCallback() {
    if (this._map) {
      if (this._map.getLayer(this._layerId)) {
        this._map.removeLayer(this._layerId)
      }
      if (this._map.getLayer(`${this._layerId}-arrows`)) {
        this._map.removeLayer(`${this._layerId}-arrows`)
      }
      if (this._map.getSource(this._sourceId)) {
        this._map.removeSource(this._sourceId)
      }
    }
    super.disconnectedCallback()
  }
}

window.customElements.define(
  'grampsjs-map-migration-flow',
  GrampsjsMapMigrationFlow
)
