import {LitElement} from 'lit'

const {maplibregl} = window

class GrampsjsMapClusters extends LitElement {
  static get properties() {
    return {
      places: {type: Array},
      clusterRadius: {type: Number},
      _map: {type: Object, attribute: false},
    }
  }

  constructor() {
    super()
    this.places = []
    this.clusterRadius = 50
    this._sourceId = 'place-clusters'
    this._clusterLayerId = 'clusters'
    this._clusterCountLayerId = 'cluster-count'
    this._unclusteredLayerId = 'unclustered-point'
  }

  firstUpdated() {
    this._map = this.parentElement._map
    if (this._map) {
      this._map.on('load', () => {
        this.addClustersToMap()
      })
      if (this._map.isStyleLoaded()) {
        this.addClustersToMap()
      }
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('places')) {
      this.updateClusters()
    }
  }

  addClustersToMap() {
    if (!this._map || !this._map.isStyleLoaded()) return

    // Remove existing layers/source if present
    this.removeLayers()

    // Create GeoJSON from places
    const geojson = this.createGeoJSON()

    // Add source with clustering enabled
    this._map.addSource(this._sourceId, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: this.clusterRadius, // Radius of each cluster when clustering points
    })

    // Add cluster circles layer
    this._map.addLayer({
      id: this._clusterLayerId,
      type: 'circle',
      source: this._sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', // color for clusters with < 10 points
          10,
          '#f1f075', // color for clusters with 10-100 points
          100,
          '#f28cb1', // color for clusters with > 100 points
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, // radius for clusters with < 10 points
          10,
          30, // radius for clusters with 10-100 points
          100,
          40, // radius for clusters with > 100 points
        ],
      },
    })

    // Add cluster count labels
    this._map.addLayer({
      id: this._clusterCountLayerId,
      type: 'symbol',
      source: this._sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    })

    // Add unclustered point layer
    this._map.addLayer({
      id: this._unclusteredLayerId,
      type: 'circle',
      source: this._sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })

    // Add click handlers
    this._map.on('click', this._clusterLayerId, e => {
      const features = this._map.queryRenderedFeatures(e.point, {
        layers: [this._clusterLayerId],
      })
      const clusterId = features[0].properties.cluster_id
      this._map
        .getSource(this._sourceId)
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          this._map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          })
        })
    })

    // Add click handler for unclustered points
    this._map.on('click', this._unclusteredLayerId, e => {
      const coordinates = e.features[0].geometry.coordinates.slice()
      const {name, handle} = e.features[0].properties

      // Emit event for parent component
      this.dispatchEvent(
        new CustomEvent('cluster:place-clicked', {
          bubbles: true,
          composed: true,
          detail: {
            handle,
            name,
            latitude: coordinates[1],
            longitude: coordinates[0],
          },
        })
      )

      // Show popup
      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<strong>${name}</strong>`)
        .addTo(this._map)
    })

    // Change cursor on hover
    this._map.on('mouseenter', this._clusterLayerId, () => {
      this._map.getCanvas().style.cursor = 'pointer'
    })
    this._map.on('mouseleave', this._clusterLayerId, () => {
      this._map.getCanvas().style.cursor = ''
    })
    this._map.on('mouseenter', this._unclusteredLayerId, () => {
      this._map.getCanvas().style.cursor = 'pointer'
    })
    this._map.on('mouseleave', this._unclusteredLayerId, () => {
      this._map.getCanvas().style.cursor = ''
    })
  }

  createGeoJSON() {
    const features = this.places
      .filter(
        place =>
          place?.latitude &&
          place?.longitude &&
          (place.latitude !== 0 || place.longitude !== 0)
      )
      .map(place => {
        // Standardize place data - handle both API formats
        const lat = place.latitude || place.profile?.lat
        const lng = place.longitude || place.profile?.long
        const handle = place.handle || place.gramps_id
        const name = place.name || place.profile?.name || 'Unknown'

        return {
          type: 'Feature',
          properties: {
            handle,
            name,
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        }
      })

    return {
      type: 'FeatureCollection',
      features,
    }
  }

  updateClusters() {
    if (!this._map || !this._map.getSource(this._sourceId)) {
      // If map is ready but layers aren't added yet, add them
      if (this._map && this._map.isStyleLoaded()) {
        this.addClustersToMap()
      }
      return
    }

    const geojson = this.createGeoJSON()
    this._map.getSource(this._sourceId).setData(geojson)
  }

  removeLayers() {
    if (!this._map) return

    const layers = [
      this._unclusteredLayerId,
      this._clusterCountLayerId,
      this._clusterLayerId,
    ]

    layers.forEach(layerId => {
      if (this._map.getLayer(layerId)) {
        this._map.removeLayer(layerId)
      }
    })

    if (this._map.getSource(this._sourceId)) {
      this._map.removeSource(this._sourceId)
    }
  }

  disconnectedCallback() {
    this.removeLayers()
    super.disconnectedCallback()
  }
}

window.customElements.define('grampsjs-map-clusters', GrampsjsMapClusters)
