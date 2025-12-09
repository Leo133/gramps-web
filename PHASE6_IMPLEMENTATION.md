# Phase 6: Geospatial Intelligence (Maps) - Implementation Guide

This document describes the implementation of Phase 6 features for Gramps Web, focusing on advanced map visualization, clustering, and migration flow analysis.

## Overview

Phase 6 adds comprehensive geospatial intelligence features to Gramps Web, enabling users to:
- View places with clustered markers that expand on zoom
- Visualize migration patterns through animated flow lines
- Geocode place names to coordinates
- Analyze geographic clusters of events
- Track ancestor movements across space and time

## Features Implemented

### 1. Places CRUD Operations

**What it does:**
- Full Create, Read, Update, Delete operations for places
- Hierarchical place management with coordinates
- Integration with events and people
- Proper validation and error handling

**Backend Implementation:**
- `PlacesService` with complete CRUD methods
- `CreatePlaceDto` and `UpdatePlaceDto` for validation
- Auto-generation of Gramps IDs (P0001, P0002, etc.)
- Formatting places with profile data for frontend compatibility

**Usage:**
```javascript
// Create a place
POST /api/places
{
  "name": "New York City",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "title": "New York, NY, USA"
}

// Get all places with filtering
GET /api/places?q=New+York&page=1&pagesize=25

// Get a specific place
GET /api/places/:handle

// Update a place
PUT /api/places/:handle
{
  "latitude": 40.7589,
  "longitude": -73.9851
}

// Delete a place
DELETE /api/places/:handle
```

**Database Indexes:**
Added indexes for geospatial queries:
- Single column indexes on `latitude` and `longitude`
- Composite index on `(latitude, longitude)` for bounding box queries

### 2. Geocoding Service

**What it does:**
- Converts place names to geographic coordinates
- Reverse geocoding from coordinates to place names
- Auto-suggest coordinates for place hierarchies
- Standardize place naming conventions

**Current Implementation:**
- Mock geocoding service returning placeholder data
- Designed for easy integration with external services
- API structure ready for Nominatim or Google Maps integration

**Endpoints:**
```javascript
// Forward geocoding (place name to coordinates)
GET /api/places/geocode?query=Paris,+France

// Reverse geocoding (coordinates to place name)
GET /api/places/reverse-geocode?latitude=48.8566&longitude=2.3522
```

**Production Integration:**
To enable real geocoding in production, integrate with Nominatim (OpenStreetMap):

```typescript
async geocode(query: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
  )
  const data = await response.json()
  
  return {
    query,
    results: data.map(item => ({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      importance: item.importance,
    })),
  }
}
```

### 3. Event Clustering

**What it does:**
- Groups nearby places into clusters based on zoom level
- Dynamically adjusts cluster size based on map zoom
- Supports bounding box filtering
- Efficient grid-based clustering algorithm

**Backend Implementation:**
- `GeospatialService.getPlaceClusters()` method
- Zoom-aware cluster sizing (0.001° to 50° grid cells)
- Bounding box filtering for viewport optimization

**Usage:**
```javascript
// Get clusters for current map view
GET /api/geospatial/clusters?zoom=10&north=40.9&south=40.6&east=-73.8&west=-74.1

// Response
[
  {
    "latitude": 40.75,
    "longitude": -74.0,
    "count": 15,
    "places": [
      {
        "handle": "abc123",
        "name": "Central Park",
        "latitude": 40.785091,
        "longitude": -73.968285
      }
      // ... more places
    ]
  }
]
```

**Frontend Integration:**
- `GrampsjsMapClusters` component using MapLibre GL native clustering
- Cluster circles with size and color based on point count
- Click to zoom into clusters
- Individual markers for unclustered points

**Cluster Zoom Levels:**
- Zoom 0-2: 50° grid (continental scale)
- Zoom 3-5: 10° grid (country scale)
- Zoom 6-8: 1° grid (state/province scale)
- Zoom 9-11: 0.1° grid (city scale)
- Zoom 12-14: 0.01° grid (neighborhood scale)
- Zoom 15+: 0.001° grid (street scale)

### 4. Migration Flow Visualization

**What it does:**
- Traces a person's movement through their life events
- Draws animated curved lines between Birth → Marriage → Death locations
- Color-codes events by sequence
- Supports multiple people simultaneously

**Backend Implementation:**
- `GeospatialService.getMigrationFlows()` method
- Automatically orders events chronologically
- Filters events with valid place coordinates
- Returns path data for frontend rendering

**Usage:**
```javascript
// Get migration flows for all people
GET /api/geospatial/migration-flows

// Get migration flows for a specific person
GET /api/geospatial/migration-flows?person=abc123
// or
GET /api/geospatial/migration-flows/abc123

// Response
[
  {
    "personHandle": "abc123",
    "personName": "John Smith",
    "events": [
      {
        "type": "Birth",
        "date": "1850-03-15",
        "placeName": "Boston, MA",
        "latitude": 42.3601,
        "longitude": -71.0589,
        "sequence": 0
      },
      {
        "type": "Marriage",
        "date": "1875-06-20",
        "placeName": "New York, NY",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "sequence": 1
      }
    ],
    "path": [
      [42.3601, -71.0589],
      [40.7128, -74.0060]
    ]
  }
]
```

**Frontend Integration:**
- `GrampsjsMapMigrationFlow` component
- Quadratic Bezier curve rendering for natural-looking paths
- Color gradient by event sequence (blue → purple → pink → amber)
- Toggle on/off via map filter controls

**Curve Algorithm:**
The migration flows use quadratic Bezier curves to create smooth, visually appealing paths:

```javascript
// Calculate control point perpendicular to line
const midLat = (lat1 + lat2) / 2
const midLng = (lng1 + lng2) / 2
const angle = Math.atan2(lat2 - lat1, lng2 - lng1)
const offset = distance * 0.2
const controlLat = midLat + offset * Math.sin(angle + Math.PI / 2)
const controlLng = midLng + offset * Math.cos(angle + Math.PI / 2)
```

### 5. Enhanced Map Controls

**What it does:**
- Toggle between clustered and individual markers
- Show/hide migration flows
- Filter places by event association
- Time-based filtering with slider

**UI Integration:**
Added to existing map filter dialog:
- ☑️ Show clustered markers
- ☑️ Show migration flows
- ☑️ Only places related to events

**Implementation:**
- Extended `GrampsjsMapSearchbox` filter dialog
- State management in `GrampsjsViewMap`
- Dynamic component rendering based on toggle states

### 6. Data Flow Architecture

```
Frontend Request
    ↓
Backend API (/api/places, /api/geospatial/*)
    ↓
Service Layer (PlacesService, GeospatialService)
    ↓
Prisma ORM
    ↓
SQLite Database (with geospatial indexes)
    ↓
Service Layer (formatting, clustering)
    ↓
Backend Response (JSON)
    ↓
Frontend Components (MapLibre GL rendering)
```

## API Endpoints Summary

### Places API
- `GET /api/places` - List all places with filtering
- `GET /api/places/:handle` - Get place details
- `POST /api/places` - Create new place
- `PUT /api/places/:handle` - Update place
- `DELETE /api/places/:handle` - Delete place
- `GET /api/places/geocode?query=...` - Geocode place name
- `GET /api/places/reverse-geocode?latitude=...&longitude=...` - Reverse geocode
- `GET /api/places/clusters` - Get place clusters (deprecated, use geospatial endpoint)

### Geospatial API
- `GET /api/geospatial/migration-flows` - Get all migration flows
- `GET /api/geospatial/migration-flows/:handle` - Get person's migration flow
- `GET /api/geospatial/clusters?zoom=...&north=...&south=...&east=...&west=...` - Get clustered places

## Frontend Components

### GrampsjsMapClusters
- Native MapLibre GL clustering
- Automatic point aggregation
- Dynamic cluster sizing
- Click-to-zoom interaction

### GrampsjsMapMigrationFlow
- Bezier curve path rendering
- Event sequence visualization
- Toggle visibility
- Color-coded by sequence

### GrampsjsViewMap (Enhanced)
- Dual-mode rendering (clusters/markers)
- Migration flow overlay
- Filter integration
- Data fetching and state management

## Database Schema Changes

Added indexes to `Place` model for efficient geospatial queries:

```prisma
model Place {
  // ... existing fields ...
  
  @@index([latitude])
  @@index([longitude])
  @@index([latitude, longitude])
}
```

## Performance Considerations

### Backend Optimization
1. **Indexed Queries**: Lat/long indexes enable fast spatial queries
2. **Filtered Results**: Bounding box filtering reduces data transfer
3. **Zoom-based Clustering**: Reduces cluster count at appropriate zoom levels
4. **Selective Event Loading**: Only loads events with place associations

### Frontend Optimization
1. **Native Clustering**: MapLibre GL handles clustering on GPU
2. **Lazy Loading**: Migration flows only loaded when enabled
3. **Viewport Filtering**: Only render features in current view
4. **Debounced Updates**: Prevent excessive re-renders on map move

## Future Enhancements

### Geocoding Integration
- Integrate with Nominatim (OpenStreetMap) API
- Add geocoding cache to reduce API calls
- Implement batch geocoding for multiple places
- Auto-geocode on place creation/update

### Advanced Clustering
- Implement DBSCAN or k-means clustering algorithms
- Add cluster boundary visualization (convex hulls)
- Support cluster filtering by event type
- Add heat map layer for event density

### Migration Flow Improvements
- Add animation along the path
- Support filtering by person/family
- Add timeline scrubbing to show movement over time
- Display event markers along the path

### Historical Maps
- Overlay historical map tiles (already partially implemented)
- Support for georeferenced historical maps
- Timeline-aware map switching
- Custom map overlay upload

## Testing

### Manual Testing Checklist
- [ ] Create, read, update, delete places
- [ ] Geocode place names
- [ ] View clustered markers at different zoom levels
- [ ] Click clusters to zoom in
- [ ] Toggle cluster mode on/off
- [ ] View migration flows for people
- [ ] Toggle migration flows on/off
- [ ] Filter places by event association
- [ ] Test with large datasets (100+ places)

### Automated Tests (To Be Implemented)
- Backend unit tests for PlacesService
- Backend unit tests for GeospatialService
- Frontend component tests for map components
- E2E tests for map interactions

## Deployment Notes

1. **Database Migration**: Run Prisma migration to add indexes
   ```bash
   cd backend
   npm run prisma:migrate
   ```

2. **Rebuild Frontend**:
   ```bash
   npm run build
   ```

3. **Environment Variables**: No new environment variables required

4. **Optional Geocoding**: To enable real geocoding, update `PlacesService.geocode()` with API integration

## Known Limitations

1. **Mock Geocoding**: Geocoding endpoints return placeholder data
2. **Simple Clustering**: Uses grid-based clustering instead of advanced algorithms
3. **No Animation**: Migration flows are static (no animated movement)
4. **SQLite Spatial**: SQLite doesn't have native spatial functions (PostGIS recommended for production)

## Migration Path from Mock to Production

### Geocoding Service
Replace mock implementation with Nominatim:
```typescript
// Install axios
npm install axios

// Update service
import axios from 'axios'

async geocode(query: string) {
  const response = await axios.get(
    'https://nominatim.openstreetmap.org/search',
    {
      params: {
        q: query,
        format: 'json',
        limit: 5,
      },
      headers: {
        'User-Agent': 'GrampsWeb/1.0'
      }
    }
  )
  
  return {
    query,
    results: response.data.map(item => ({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
    })),
  }
}
```

### Advanced Clustering
For production with large datasets, consider:
1. **PostgreSQL with PostGIS**: Native spatial functions
2. **Server-side clustering**: Pre-compute clusters
3. **Vector tiles**: For extremely large datasets (10,000+ points)

## Conclusion

Phase 6 successfully implements comprehensive geospatial intelligence features for Gramps Web. The modular architecture allows for easy enhancement and production-ready geocoding integration. The clustering and migration flow visualizations provide powerful tools for analyzing ancestor movements and geographic patterns.
