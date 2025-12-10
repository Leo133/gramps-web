# Phase 15 Implementation Guide: Legacy Compatibility & Advanced Science

## Overview

Phase 15 introduces advanced visualization capabilities, blogging features, and genealogy-specific utilities to Gramps Web. This implementation focuses on supporting long-time Gramps users with familiar features while adding cutting-edge visualizations and tools for modern genealogical research.

## Architecture

### Module Structure

```
backend/src/blog/
├── blog.module.ts           # Main blog module
├── blog.controller.ts       # REST API controller (7 endpoints)
├── blog.service.ts          # Blog post management service
└── dto/
    └── blog.dto.ts         # Data transfer objects & validation

backend/src/visualizations/
├── visualizations.controller.ts  # Extended with 3 new endpoints
└── visualizations.service.ts     # Date calculator, graph data, calendar services

src/views/
├── GrampsjsViewGraphChart.js      # Force-directed graph view
├── GrampsjsViewCalendar.js        # Calendar view
└── GrampsjsViewDateCalculator.js  # Date calculator utility

src/components/
├── GrampsjsGraphChart.js          # D3.js graph visualization
└── GrampsjsCalendar.js            # Calendar grid component
```

## Features Implemented

### 1. Blog Backend Module

**Purpose:** Provides a comprehensive blogging system for narrative genealogy and family stories.

**Key Features:**
- Full CRUD operations for blog posts
- Draft/Published/Archived workflow
- Visibility controls (public, private, members)
- Tag and category support
- Slug-based URLs for SEO
- Featured image support
- Author attribution
- Excerpt/summary support

**Database Model:**
```typescript
model BlogPost {
  id            String    @id @default(uuid())
  title         String
  slug          String    @unique
  content       String    // Rich text content (HTML or Markdown)
  excerpt       String?   // Optional summary
  authorId      String
  status        String    @default("draft") // draft, published, archived
  visibility    String    @default("public") // public, private, members
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  featuredImage String?   // Media handle or URL
  tags          String?   // JSON array of tags
  categories    String?   // JSON array of categories
  metadata      String?   // JSON for additional metadata
  
  author User @relation(fields: [authorId], references: [id])
}
```

**API Endpoints:**

1. **Create Blog Post**
   ```
   POST /api/blog
   Body: CreateBlogPostDto
   Roles: contributor, editor, owner
   ```

2. **List Blog Posts**
   ```
   GET /api/blog?status=published&tag=family&page=1&pagesize=20
   Query params: status, visibility, authorId, tag, category, page, pagesize
   ```

3. **Get Blog Post by ID**
   ```
   GET /api/blog/:id
   ```

4. **Get Blog Post by Slug**
   ```
   GET /api/blog/slug/:slug
   ```

5. **Get All Tags**
   ```
   GET /api/blog/tags
   ```

6. **Get All Categories**
   ```
   GET /api/blog/categories
   ```

7. **Update Blog Post**
   ```
   PUT /api/blog/:id
   Body: UpdateBlogPostDto
   Roles: contributor, editor, owner (own posts only)
   ```

8. **Delete Blog Post**
   ```
   DELETE /api/blog/:id
   Roles: contributor, editor, owner (own posts only)
   ```

**Usage Example:**
```typescript
// Create a blog post
POST /api/blog
{
  "title": "The Smith Family Journey",
  "slug": "smith-family-journey",
  "content": "<p>Our family's story begins in...</p>",
  "excerpt": "Tracing the Smith family from Ireland to America",
  "status": "published",
  "visibility": "public",
  "tags": ["family-history", "immigration", "ireland"],
  "categories": ["Family Stories"],
  "publishedAt": "2024-12-10T00:00:00Z"
}

// Get published posts with a specific tag
GET /api/blog?status=published&tag=immigration&pagesize=10
```

### 2. Force-Directed Graph Visualization

**Purpose:** Provides an interactive, zoomable visualization of the entire family tree using force-directed graph layout.

**Key Features:**
- D3.js force simulation for natural layout
- Gender-based color coding (blue=male, pink=female, gray=unknown)
- Two types of relationships:
  - Solid lines for parent-child relationships
  - Dashed lines for spousal relationships
- Interactive features:
  - Click nodes to navigate to person page
  - Drag nodes to reposition
  - Zoom and pan controls
  - Collision detection

**API Endpoint:**
```
GET /api/visualizations/graph-data
```

**Response Format:**
```typescript
{
  "nodes": [
    {
      "id": "person_handle",
      "grampsId": "I0001",
      "name": "John Smith",
      "gender": 1,
      "birthYear": 1950,
      "deathYear": null
    }
  ],
  "links": [
    {
      "source": "parent_handle",
      "target": "child_handle",
      "type": "parent"
    },
    {
      "source": "spouse1_handle",
      "target": "spouse2_handle",
      "type": "spouse"
    }
  ],
  "stats": {
    "totalPeople": 150,
    "totalRelationships": 280
  }
}
```

**Frontend Component:**
- Uses D3.js v7 force simulation
- Implements drag behavior for manual node positioning
- Implements zoom behavior (0.1x to 4x scale)
- Responsive to container size
- Click handler for navigation

### 3. Calendar View

**Purpose:** Displays family events (birthdays, death anniversaries) in a monthly calendar format.

**Key Features:**
- Monthly calendar grid
- Birthday indicators with age calculation
- Death anniversary indicators
- Click events to navigate to person
- Month/year navigation
- Event type color coding:
  - Blue for birthdays (🎂)
  - Pink for death anniversaries (†)
  - Purple for other anniversaries (💍)

**API Endpoint:**
```
GET /api/visualizations/calendar/:year/:month
```

**Response Format:**
```typescript
{
  "year": 2024,
  "month": 12,
  "events": [
    {
      "date": 15,
      "type": "birthday",
      "person": {
        "handle": "person_handle",
        "name": "John Smith"
      },
      "year": 1950,
      "age": 74
    }
  ],
  "totalEvents": 8
}
```

**Frontend Component:**
- Grid layout with 7 columns (days of week)
- Dynamic month generation
- Event click handlers
- Responsive design
- Emoji indicators for event types

### 4. Date Calculator

**Purpose:** Provides various date calculation utilities for genealogical research.

**Supported Operations:**

1. **Age Calculation**
   - Calculate age from birth date to now or specified date
   - Returns years, months, days, and total days

2. **Date Difference**
   - Calculate difference between two dates
   - Returns years, months, days, total days, and total weeks

3. **Day of Week**
   - Determine day of week for any date
   - Returns day name and number

4. **Add to Date**
   - Add days, months, or years to a date
   - Returns resulting date

5. **Subtract from Date**
   - Subtract days, months, or years from a date
   - Returns resulting date

**API Endpoint:**
```
POST /api/visualizations/date-calculator
```

**Request Examples:**

```typescript
// Calculate age
{
  "operation": "age",
  "date1": "1950-06-15",
  "date2": "2024-12-10"  // Optional, defaults to now
}

// Calculate difference
{
  "operation": "difference",
  "date1": "1950-06-15",
  "date2": "2024-12-10"
}

// Get day of week
{
  "operation": "dayOfWeek",
  "date1": "1950-06-15"
}

// Add to date
{
  "operation": "add",
  "date1": "1950-06-15",
  "amount": 30,
  "unit": "years"
}
```

**Response Examples:**

```typescript
// Age calculation result
{
  "years": 74,
  "months": 5,
  "days": 25,
  "totalDays": 27207,
  "description": "74 years, 5 months, 25 days"
}

// Day of week result
{
  "dayOfWeek": "Thursday",
  "dayNumber": 4,
  "date": "1950-06-15"
}
```

**Frontend Component:**
- Form-based interface
- Operation selector
- Dynamic form fields based on operation
- Result display with formatted output
- Input validation

## Database Schema Changes

### New Model: BlogPost

Added to `backend/prisma/schema.prisma`:

```prisma
model BlogPost {
  id            String    @id @default(uuid())
  title         String
  slug          String    @unique
  content       String
  excerpt       String?
  authorId      String    @map("author_id")
  status        String    @default("draft")
  visibility    String    @default("public")
  publishedAt   DateTime? @map("published_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  featuredImage String?   @map("featured_image")
  tags          String?
  categories    String?
  metadata      String?

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("blog_posts")
  @@index([authorId])
  @@index([status])
  @@index([publishedAt])
  @@index([slug])
}
```

### User Model Update

Added relation to User model:
```prisma
blogPosts BlogPost[]
```

## Migration

Migration file created: `backend/prisma/migrations/20241210024205_add_blog_posts/migration.sql`

To apply the migration:
```bash
cd backend
npm run prisma:migrate
```

## Testing

### Backend Testing

Test the blog endpoints:
```bash
# Create a blog post
curl -X POST http://localhost:5555/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Post",
    "slug": "test-post",
    "content": "<p>Test content</p>",
    "status": "published"
  }'

# Get all posts
curl http://localhost:5555/api/blog?status=published

# Get graph data
curl http://localhost:5555/api/visualizations/graph-data

# Get calendar data
curl http://localhost:5555/api/visualizations/calendar/2024/12

# Calculate age
curl -X POST http://localhost:5555/api/visualizations/date-calculator \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "age",
    "date1": "1950-06-15"
  }'
```

### Frontend Testing

1. Navigate to the graph view
2. Navigate to the calendar view
3. Navigate to the date calculator
4. Test blog post creation and viewing

## Security Considerations

1. **Blog Posts:**
   - Contributors can only edit/delete their own posts
   - Editors and owners can manage all posts
   - Visibility controls protect private content
   - Input validation prevents XSS

2. **API Endpoints:**
   - All blog endpoints require authentication
   - Role-based access control enforced
   - Input sanitization for all user-provided data

3. **Data Privacy:**
   - Living persons can be filtered from calendar view
   - Visibility settings respect privacy levels

## Performance Considerations

1. **Graph Visualization:**
   - Limit nodes for very large trees (>1000 people)
   - Consider server-side clustering for massive datasets
   - Use canvas rendering for >500 nodes

2. **Calendar Events:**
   - Date parsing optimized for performance
   - Events filtered by month on server side
   - Efficient indexing on date fields

3. **Blog Posts:**
   - Pagination for large post lists
   - Indexing on status, slug, and publishedAt fields
   - Tag/category filtering done in memory (optimize for large datasets)

## Future Enhancements

1. **Blog:**
   - Rich text editor integration
   - Image upload and management
   - Comment threading
   - RSS feed generation
   - Full-text search

2. **Graph View:**
   - WebGL/PixiJS rendering for >1000 nodes
   - Clustering algorithms for large trees
   - Minimap for navigation
   - Filter by generation, surname, etc.

3. **Calendar:**
   - Event color customization
   - Export to iCal format
   - Reminder notifications
   - Historical event integration

4. **Date Calculator:**
   - Julian/Gregorian calendar conversion
   - Historical date formatting
   - Date range validation
   - Genealogy-specific calculations

## Documentation Updates

- Update main README with new features
- Add blog usage guide
- Add visualization guide
- Update API documentation
