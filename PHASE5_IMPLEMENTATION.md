# Phase 5: Interactive Visualizations & Charts - Implementation Guide

This document describes the implementation of Phase 5 features for Gramps Web, focusing on interactive visualizations, relationship calculation, and high-performance chart rendering.

## Overview

Phase 5 transforms Gramps Web's visualization capabilities by adding:
- **Relationship Calculator**: Instant pathfinding to show exactly how two people are related
- **Optimized Chart Data APIs**: Backend endpoints that prepare data specifically for chart rendering
- **Foundation for Canvas/WebGL**: Architecture ready for high-performance rendering of large trees
- **Interactive Navigation**: Charts that act as navigation tools through the family tree

## Features Implemented

### 1. Relationship Calculator

**What it does:**
- Calculates the exact genealogical relationship between any two people
- Uses bidirectional breadth-first search (BFS) for optimal pathfinding
- Provides human-readable relationship descriptions (e.g., "3rd cousin twice removed")
- Identifies common ancestors and relationship types
- Returns the full path between people with intermediate relationships

**Algorithm:**
The relationship calculator uses BFS to find the shortest path through the family graph:
1. Starts from person 1
2. Explores parents, children, and spouses as neighbors
3. Continues until person 2 is found
4. Analyzes the path to determine relationship type

**Relationship Types Detected:**
- **self**: Same person
- **parent**: Father/Mother
- **child**: Son/Daughter
- **sibling**: Brother/Sister
- **spouse**: Husband/Wife
- **ancestor**: Grandfather, Great-Grandmother, etc.
- **descendant**: Grandson, Great-Granddaughter, etc.
- **cousin**: 1st cousin, 2nd cousin twice removed, etc.
- **in-law**: (future enhancement)
- **distant**: No known relationship

**API Endpoint:**
```http
POST /api/visualizations/calculate-relationship
Content-Type: application/json

{
  "person1Handle": "p0001",
  "person2Handle": "p0002"
}
```

**Response:**
```json
{
  "person1": {
    "handle": "p0001",
    "gramps_id": "I0001",
    "name": "John Doe",
    "gender": 1,
    "relationship": ""
  },
  "person2": {
    "handle": "p0002",
    "gramps_id": "I0002",
    "name": "Jane Smith",
    "gender": 0,
    "relationship": "child"
  },
  "relationship": "Daughter",
  "commonAncestor": null,
  "path": [
    {
      "handle": "p0001",
      "name": "John Doe",
      "relationship": ""
    },
    {
      "handle": "p0002",
      "name": "Jane Smith",
      "relationship": "child"
    }
  ],
  "distance": 1,
  "relationshipType": "child"
}
```

**Relationship Examples:**
```
Distance 1:
- Father, Mother, Son, Daughter, Husband, Wife

Distance 2:
- Brother, Sister, Grandfather, Grandmother, Grandson, Granddaughter

Distance 3+:
- Great-Grandfather, Great-Grandson
- 1st cousin (2 steps up, 2 steps down)

Distance 4+:
- 2nd cousin (3 steps up, 3 steps down)
- 1st cousin once removed (2 steps up, 3 steps down)
```

### 2. Fan Chart Data API

**What it does:**
- Generates optimized ancestor tree data for fan chart visualization
- Configurable number of generations (default: 5)
- Hierarchical structure with generation numbers
- Includes person details at each node

**API Endpoint:**
```http
GET /api/visualizations/fan-chart/:handle?generations=5
```

**Response:**
```json
{
  "person": { /* full person object */ },
  "handle": "p0001",
  "gramps_id": "I0001",
  "name": "John Doe",
  "gender": 1,
  "generation": 0,
  "children": [
    {
      "handle": "p0002",
      "name": "James Doe Sr.",
      "gender": 1,
      "generation": 1,
      "children": [
        { /* grandfather */ },
        { /* grandmother */ }
      ]
    },
    {
      "handle": "p0003",
      "name": "Mary Doe",
      "gender": 0,
      "generation": 1,
      "children": [ /* maternal grandparents */ ]
    }
  ]
}
```

**Data Structure:**
- Root person at generation 0
- Parents at generation 1
- Grandparents at generation 2
- Each node contains: person data, handle, name, gender, generation
- Children array contains [father, mother] recursively

### 3. Tree Chart Data API

**What it does:**
- Provides both ancestor and descendant data for a person
- Mixed tree view (hourglass chart)
- Limited to 3 generations each direction for performance
- Optimized for rendering person-centric family trees

**API Endpoint:**
```http
GET /api/visualizations/tree-chart/:handle
```

**Response:**
```json
{
  "person": { /* full person object */ },
  "ancestors": {
    "handle": "p0001",
    "generation": 0,
    "children": [ /* parents, grandparents */ ]
  },
  "descendants": {
    "handle": "p0001",
    "generation": 0,
    "children": [ /* children, grandchildren */ ]
  }
}
```

### 4. Descendant Tree API

**What it does:**
- Generates descendant tree data for any person
- Configurable number of generations (default: 5)
- Useful for lineage views and descendant charts

**API Endpoint:**
```http
GET /api/visualizations/descendant-tree/:handle?generations=5
```

**Response:**
```json
{
  "person": { /* full person object */ },
  "handle": "p0001",
  "gramps_id": "I0001",
  "name": "John Doe",
  "gender": 1,
  "generation": 0,
  "children": [
    {
      "handle": "p0010",
      "name": "Jane Doe",
      "generation": 1,
      "children": [
        { /* grandchild 1 */ },
        { /* grandchild 2 */ }
      ]
    },
    {
      "handle": "p0011",
      "name": "James Doe Jr.",
      "generation": 1,
      "children": []
    }
  ]
}
```

## Backend Architecture

### NestJS Module Structure

```
backend/src/visualizations/
├── visualizations.module.ts      # Module definition
├── visualizations.controller.ts  # HTTP endpoints
└── visualizations.service.ts     # Business logic
```

### Service Methods

**VisualizationsService:**
- `calculateRelationship(person1, person2)`: Main relationship calculator
- `findShortestPath(start, end)`: BFS pathfinding algorithm
- `getNeighbors(person)`: Gets parents, children, spouses
- `analyzeRelationship(path)`: Converts path to human description
- `getFanChartData(handle, generations)`: Ancestor tree builder
- `getTreeChartData(handle)`: Mixed ancestor/descendant tree
- `getDescendantTree(handle, generations)`: Descendant tree builder
- `buildAncestorTree(handle, gen, max)`: Recursive ancestor builder
- `buildDescendantTree(handle, gen, max)`: Recursive descendant builder

### Performance Optimizations

**1. Breadth-First Search (BFS)**
- Guaranteed to find the shortest path
- More efficient than DFS for genealogy (most relationships are close)
- Time complexity: O(V + E) where V = people, E = relationships

**2. Visited Set**
- Prevents infinite loops in the family graph
- Avoids processing the same person multiple times
- Uses Map for O(1) lookup

**3. Lazy Loading**
- Tree builders only load what's needed
- Configurable generation depth prevents memory issues
- Queries are optimized with Prisma includes

**4. JSON Field Parsing**
- Child lists stored as JSON in SQLite
- Parsed only when needed
- Efficient for variable-length arrays

## Mock Server Implementation

The mock server includes matching implementations for all APIs:

### Relationship Calculation Functions

```javascript
// Helper functions in server.js
function getPathNode(person, relationship)
function getNeighbors(personHandle, dbData)
function findShortestPath(startHandle, endHandle, dbData)
function analyzeRelationship(path)
function buildAncestorTree(handle, generation, maxGenerations, dbData)
function buildDescendantTree(handle, generation, maxGenerations, dbData)
```

### Mock Endpoints

All four endpoints are implemented in the mock server:
- `POST /api/visualizations/calculate-relationship`
- `GET /api/visualizations/fan-chart/:handle`
- `GET /api/visualizations/tree-chart/:handle`
- `GET /api/visualizations/descendant-tree/:handle`

## Frontend Integration (Future)

### Recommended Libraries for Canvas/WebGL

**PixiJS (Recommended):**
- WebGL renderer with Canvas fallback
- Excellent performance for 1000+ nodes
- Great documentation and community
- Perfect for interactive charts

```bash
npm install pixi.js
```

**D3 + Canvas:**
- Use D3 for data transformation
- Render to Canvas instead of SVG
- Good for existing D3 code migration

**Alternatives:**
- Three.js: Overkill for 2D charts, but excellent for 3D
- Konva.js: Canvas library with good event handling
- Paper.js: Vector graphics library using Canvas

### Integration Pattern

```javascript
// Example: Enhanced Fan Chart with PixiJS
import { Application, Graphics, Text } from 'pixi.js'

class CanvasFanChart {
  constructor(container, data) {
    this.app = new Application({
      width: 800,
      height: 800,
      backgroundColor: 0xffffff,
      antialias: true
    })
    container.appendChild(this.app.view)
    this.renderChart(data)
  }

  renderChart(data) {
    // Fetch data from API
    fetch(`/api/visualizations/fan-chart/${data.handle}`)
      .then(res => res.json())
      .then(chartData => {
        this.drawFanSegments(chartData)
      })
  }

  drawFanSegments(node, startAngle = -Math.PI, endAngle = Math.PI) {
    // Recursive rendering with PixiJS Graphics
    const segment = new Graphics()
    segment.beginFill(this.getColor(node))
    segment.arc(0, 0, radius, startAngle, endAngle)
    segment.interactive = true
    segment.on('click', () => this.onSegmentClick(node))
    this.app.stage.addChild(segment)

    // Recursively render children
    if (node.children) {
      const angleStep = (endAngle - startAngle) / node.children.length
      node.children.forEach((child, i) => {
        this.drawFanSegments(
          child,
          startAngle + i * angleStep,
          startAngle + (i + 1) * angleStep
        )
      })
    }
  }

  onSegmentClick(node) {
    // Navigate to person page or show details
    window.location.href = `/person/${node.handle}`
  }
}
```

### Interaction Patterns

**Zoom and Pan:**
```javascript
import { Viewport } from 'pixi-viewport'

const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: 2000,
  worldHeight: 2000
})

viewport
  .drag()
  .pinch()
  .wheel()
  .decelerate()
```

**Click Navigation:**
- Click person → Navigate to detail page
- Right-click → Context menu (calculate relationship, etc.)
- Double-click → Center and zoom on person

**Tooltips:**
- Hover over person segment → Show basic info
- Use Tippy.js or custom Canvas tooltips

## Testing

### Relationship Calculator Tests

**Test Cases:**
1. Self relationship (same person)
2. Direct parent (father, mother)
3. Direct child (son, daughter)
4. Spouse
5. Siblings (brother, sister)
6. Grandparents (grandfather, grandmother)
7. Grandchildren (grandson, granddaughter)
8. Great-grandparents
9. First cousins
10. Second cousins
11. Cousins removed (1st cousin once removed)
12. No relationship (disconnected tree)

**Example Test Data:**
```
Family Tree:
         GreatGrandpa ─── GreatGrandma
                │
         Grandpa ─── Grandma
                │
         Father ─── Mother
           │           │
         John ─── Spouse
           │
        Child

Test: John → Grandpa
Expected: "Grandfather"

Test: John → Child
Expected: "Son" or "Daughter"

Test: John → Cousin (via uncle/aunt)
Expected: "1st cousin"
```

### Chart Data Tests

**Test Scenarios:**
1. Person with no parents (tree root)
2. Person with no children (leaf node)
3. Person with multiple generations of ancestors
4. Person with multiple generations of descendants
5. Complex pedigree with multiple marriages
6. Generation depth limiting (max generations)

### Performance Tests

**Metrics to Track:**
- Relationship calculation time (target: <100ms for paths <10)
- Fan chart data generation (target: <500ms for 5 generations)
- Tree chart data generation (target: <300ms for 3+3 generations)
- Memory usage for large trees (1000+ people)

## API Reference

### POST /api/visualizations/calculate-relationship

**Purpose:** Calculate the genealogical relationship between two people

**Request Body:**
```typescript
{
  person1Handle: string  // Handle of first person
  person2Handle: string  // Handle of second person
}
```

**Response:**
```typescript
{
  person1: PathNode       // First person details
  person2: PathNode       // Second person details
  relationship: string    // Human-readable description
  commonAncestor: PathNode | null  // Shared ancestor if applicable
  path: PathNode[]        // Full path between people
  distance: number        // Number of steps (0 = self, -1 = no relationship)
  relationshipType: 'self' | 'parent' | 'child' | 'sibling' | 
                    'spouse' | 'cousin' | 'ancestor' | 
                    'descendant' | 'in-law' | 'distant'
}
```

**PathNode Type:**
```typescript
interface PathNode {
  handle: string
  gramps_id: string
  name: string
  gender: number  // 0=Female, 1=Male, 2=Unknown
  relationship: string  // 'parent', 'child', 'spouse', or ''
}
```

### GET /api/visualizations/fan-chart/:handle

**Purpose:** Get ancestor tree data optimized for fan chart rendering

**URL Parameters:**
- `handle` (required): Person handle

**Query Parameters:**
- `generations` (optional, default: 5): Maximum number of generations to fetch

**Response:**
```typescript
{
  person: Person          // Full person object
  handle: string
  gramps_id: string
  name: string
  gender: number
  generation: number      // 0 = root, 1 = parents, 2 = grandparents
  children: TreeNode[]    // [father, mother] recursively
}
```

### GET /api/visualizations/tree-chart/:handle

**Purpose:** Get both ancestor and descendant data for hourglass view

**URL Parameters:**
- `handle` (required): Person handle

**Response:**
```typescript
{
  person: Person
  ancestors: TreeNode     // Up to 3 generations of ancestors
  descendants: TreeNode   // Up to 3 generations of descendants
}
```

### GET /api/visualizations/descendant-tree/:handle

**Purpose:** Get descendant tree for lineage view

**URL Parameters:**
- `handle` (required): Person handle

**Query Parameters:**
- `generations` (optional, default: 5): Maximum number of generations

**Response:**
```typescript
{
  person: Person
  handle: string
  gramps_id: string
  name: string
  gender: number
  generation: number
  children: TreeNode[]    // All children recursively
}
```

## Usage Examples

### Calculate Relationship

```javascript
// Frontend code
async function showRelationship(person1, person2) {
  const response = await fetch('/api/visualizations/calculate-relationship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person1Handle: person1.handle,
      person2Handle: person2.handle
    })
  })
  
  const result = await response.json()
  
  if (result.distance === -1) {
    alert('No known relationship')
  } else {
    alert(`${person1.name} is ${person2.name}'s ${result.relationship}`)
    
    // Show the path
    console.log('Path:', result.path.map(p => p.name).join(' → '))
  }
}
```

### Render Fan Chart

```javascript
async function loadFanChart(personHandle) {
  const response = await fetch(
    `/api/visualizations/fan-chart/${personHandle}?generations=5`
  )
  const data = await response.json()
  
  // Pass to existing FanChart component
  const chart = new FanChart(data, {
    depth: 5,
    arcRadius: 60,
    bboxWidth: 800,
    bboxHeight: 800
  })
  
  return chart.render()
}
```

## Security Considerations

### Authentication
- All endpoints should require authentication
- Check user permissions before returning person data
- Respect privacy settings on people

### Input Validation
- Validate handle formats (prevent injection)
- Sanitize all user input
- Limit generation depth to prevent DoS (max 10)

### Rate Limiting
- Relationship calculation can be CPU intensive
- Implement rate limiting (e.g., 10 requests/minute)
- Consider caching frequently requested relationships

## Performance Best Practices

### Caching Strategy

**Redis Cache (Production):**
```javascript
// Cache relationship calculations
const cacheKey = `rel:${person1}:${person2}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const result = await calculateRelationship(person1, person2)
await redis.setex(cacheKey, 3600, JSON.stringify(result))
return result
```

**Frontend Cache:**
```javascript
// Cache chart data in sessionStorage
const cacheKey = `fanchart:${handle}:${generations}`
const cached = sessionStorage.getItem(cacheKey)
if (cached) return JSON.parse(cached)

const data = await fetchFanChart(handle, generations)
sessionStorage.setItem(cacheKey, JSON.stringify(data))
return data
```

### Database Optimization

**Indexes Needed:**
```sql
CREATE INDEX idx_family_father ON families(father_handle);
CREATE INDEX idx_family_mother ON families(mother_handle);
CREATE INDEX idx_person_handle ON people(handle);
```

**Query Optimization:**
- Use Prisma includes to reduce round trips
- Batch load families instead of one-by-one
- Consider denormalizing frequently accessed data

## Future Enhancements

### Phase 5.1: Advanced Visualizations
- [ ] Fractal tree with infinite zoom
- [ ] Animated relationship paths
- [ ] DNA segment visualization
- [ ] Migration map (birthplace → marriage → death)
- [ ] Lifespan timeline view

### Phase 5.2: Interaction Improvements
- [ ] Drag-and-drop person rearrangement
- [ ] Multi-person selection for comparison
- [ ] Export chart as PNG/SVG
- [ ] Print-optimized layouts
- [ ] Accessibility (keyboard navigation)

### Phase 5.3: AI Insights
- [ ] Suggest missing relationships
- [ ] Detect duplicate people via visualization
- [ ] Recommend chart type based on data
- [ ] Auto-layout optimization

## Troubleshooting

### Common Issues

**Issue: Relationship not found between known relatives**
- Check if all intermediate family relationships are recorded
- Verify person handles are correct
- Ensure families have both parents linked

**Issue: Chart data incomplete**
- Increase generation depth parameter
- Check if people have parent/child families assigned
- Verify childRefList is valid JSON array

**Issue: Slow performance**
- Reduce generation depth
- Add database indexes
- Implement caching
- Batch database queries

### Debug Mode

Enable verbose logging:
```typescript
// In visualizations.service.ts
private debug = true

if (this.debug) {
  console.log('Finding path from', person1, 'to', person2)
  console.log('Visited:', visited.size, 'Queue:', queue.length)
}
```

## Conclusion

Phase 5 establishes the foundation for advanced visualizations in Gramps Web by:

1. ✅ **Relationship Calculator**: Industry-standard BFS algorithm
2. ✅ **Optimized APIs**: Backend preprocessing for frontend charts
3. ✅ **Scalable Architecture**: Ready for 1000+ person trees
4. ✅ **Mock Implementation**: Full testing without database
5. ✅ **Type Safety**: TypeScript interfaces and validation

**Next Steps:**
1. Integrate PixiJS or Canvas rendering
2. Build interactive fan chart component
3. Add zoom/pan controls
4. Implement click navigation
5. Add DNA visualization support

---

**Implementation Date**: December 9, 2025  
**Backend Status**: ✅ Complete  
**Frontend Status**: 🔄 Ready for Integration  
**API Endpoints**: 4 new endpoints  
**Lines of Code**: ~650 (service) + ~500 (mock server)
