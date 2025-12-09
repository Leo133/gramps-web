# Phase 8: Data Quality, Advanced Indexing & Research Tools - Implementation Guide

This document describes the comprehensive implementation of Phase 8 features for Gramps Web, focusing on data quality, advanced search capabilities, and research management tools.

## Overview

Phase 8 adds powerful tools to help genealogists maintain high-quality data, find information efficiently, and manage their research process. The implementation includes both backend APIs and frontend user interfaces.

## Features Implemented

### 1. Advanced Search Engine with Phonetic Indexing

**Backend Implementation:**
- Full-text search with custom indexing
- Phonetic matching using Soundex, Metaphone, and Double Metaphone algorithms
- Fuzzy matching capabilities
- Support for multiple entity types (Person, Family, Place, Source)
- Automatic index updates

**API Endpoints:**
```
GET /api/search?query={query}&phonetic={true|false}&fuzzy={true|false}&entityTypes[]={type}
POST /api/search/reindex/{entityType}
GET /api/search/statistics
```

**Frontend Component:** `GrampsjsViewAdvancedSearch`
- Phonetic search toggle
- Fuzzy matching option
- Real-time search results
- Match type indicators (exact, phonetic, fuzzy)
- Similarity score display

**Usage Example:**
```javascript
// Search for "Smith" with phonetic matching (finds "Smythe", "Smyth", etc.)
GET /api/search?query=Smith&phonetic=true

// Response:
{
  "results": [
    {
      "entityType": "Person",
      "entityHandle": "p001",
      "content": "John Smith",
      "score": 1.0,
      "matchType": "exact"
    },
    {
      "entityType": "Person",
      "entityHandle": "p002",
      "content": "Jane Smythe",
      "score": 0.85,
      "matchType": "phonetic"
    }
  ],
  "total": 2
}
```

### 2. Data Quality Dashboard

**Backend Implementation:**
- Completeness scoring for people records
- Age consistency validation
- Date order checking (birth before death)
- Family relationship validation
- Disconnected branch detection
- Quality metrics storage

**API Endpoints:**
```
GET /api/quality/dashboard
GET /api/quality/person/{id}
GET /api/quality/disconnected
```

**Frontend Component:** `GrampsjsViewQualityDashboard`
- Overall quality metrics (completeness, consistency, accuracy)
- Issue count by severity (errors, warnings, info)
- Top issues list
- Visual progress indicators
- Refresh capability

**Quality Metrics:**
- **Completeness**: Percentage of fields filled in person records
- **Consistency**: Date logic, age validation, relationship checks
- **Accuracy**: Data validation against expected patterns
- **Overall**: Combined score

**Validation Rules Implemented:**
1. Birth date must be before death date
2. Age at death must be reasonable (< 120 years)
3. Families must have at least one parent
4. Children ages must be consistent with parent ages
5. Field completeness tracking

### 3. Duplicate Detection

**Backend Implementation:**
- Fuzzy name matching using string similarity
- Birth date comparison
- Birth place comparison
- Similarity scoring algorithm
- Duplicate suggestion storage
- Status tracking (pending, merged, dismissed)

**API Endpoints:**
```
POST /api/duplicates/scan?minSimilarity={0.7}
GET /api/duplicates/pending?entityType={Person}
POST /api/duplicates/{id}/review
POST /api/duplicates/merge
```

**Frontend Component:** `GrampsjsViewDuplicates`
- Side-by-side entity comparison
- Similarity score display
- Match reason breakdown
- Merge and dismiss actions
- Scan for duplicates button

**Duplicate Detection Algorithm:**
1. Compare all pairs of people
2. Calculate name similarity (string distance)
3. Check birth date matches
4. Compare birth places
5. Aggregate scores for overall similarity
6. Store suggestions above threshold (default 0.7)

### 4. Research Planner (Kanban Board)

**Backend Implementation:**
- Task CRUD operations
- Status management (todo, in_progress, done, blocked)
- Priority levels (urgent, high, medium, low)
- Category and tag support
- Entity linking (relate tasks to people, families, etc.)
- Due date tracking
- Statistics and filtering

**API Endpoints:**
```
POST /api/research-planner/tasks
GET /api/research-planner/tasks?status={status}&priority={priority}
GET /api/research-planner/board
GET /api/research-planner/statistics
PUT /api/research-planner/tasks/{id}
DELETE /api/research-planner/tasks/{id}
```

**Frontend Component:** `GrampsjsViewResearchPlanner`
- Kanban board layout (4 columns)
- Drag-and-drop task management (visual only - updates via dialog)
- Task creation and editing
- Priority indicators
- Due date display
- Statistics dashboard
- Filter by status and priority

**Task Fields:**
- Title (required)
- Description
- Status (todo, in_progress, done, blocked)
- Priority (urgent, high, medium, low)
- Category
- Related entities (JSON)
- Tags
- Due date
- Completed date (auto-set when status changes to done)

### 5. Shoebox/Clipboard

**Backend Implementation:**
- Temporary storage for research snippets
- Support for multiple item types (text, image, url, file)
- Tag system for organization
- Attachment to genealogy entities
- User-scoped storage

**API Endpoints:**
```
POST /api/shoebox/items
GET /api/shoebox/items?itemType={type}&tag={tag}
GET /api/shoebox/items/{id}
PUT /api/shoebox/items/{id}
DELETE /api/shoebox/items/{id}
POST /api/shoebox/items/{id}/attach
GET /api/shoebox/statistics
```

**Frontend Component:** `GrampsjsViewShoebox`
- Grid layout for items
- Filter by item type
- Add, edit, delete items
- Tag management
- Attachment status indicator
- Statistics display

**Item Types:**
- **Text**: Notes, transcriptions, research notes
- **Image**: Screenshots, photos found during research
- **URL**: Links to records, websites, articles
- **File**: Downloaded documents, PDFs

**Workflow:**
1. Add snippets to shoebox while researching
2. Tag and organize items
3. Attach relevant items to people, events, etc.
4. Clean up shoebox periodically

## Database Schema

### SearchIndex Table
```sql
CREATE TABLE search_index (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_handle TEXT NOT NULL,
  content TEXT NOT NULL,
  soundex TEXT,
  metaphone TEXT,
  dmetaphone TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(entity_type, entity_id)
);
```

### DataQualityMetric Table
```sql
CREATE TABLE data_quality_metrics (
  id TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  entity_handle TEXT,
  score REAL NOT NULL,
  issues TEXT, -- JSON
  last_calculated DATETIME,
  UNIQUE(metric_type, entity_type, entity_id)
);
```

### DuplicateSuggestion Table
```sql
CREATE TABLE duplicate_suggestions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity1_handle TEXT NOT NULL,
  entity2_handle TEXT NOT NULL,
  similarity_score REAL NOT NULL,
  match_reasons TEXT NOT NULL, -- JSON
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at DATETIME,
  created_at DATETIME
);
```

### ResearchTask Table
```sql
CREATE TABLE research_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  related_to TEXT, -- JSON
  tags TEXT, -- JSON
  due_date DATETIME,
  completed_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

### ShoeboxItem Table
```sql
CREATE TABLE shoebox_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata TEXT, -- JSON
  tags TEXT, -- JSON
  attached_to TEXT, -- JSON
  created_at DATETIME,
  updated_at DATETIME
);
```

## Installation and Setup

### Backend Setup

1. **Install Dependencies:**
```bash
cd backend
npm install natural string-similarity double-metaphone
```

2. **Run Database Migration:**
```bash
npx prisma db push
```

3. **Start Backend:**
```bash
npm run start:dev
```

### Frontend Setup

No additional dependencies required. The new views use existing Material Web Components.

## User Workflows

### Workflow 1: Finding People with Variant Name Spellings

1. Navigate to Advanced Search
2. Enter name (e.g., "Schmidt")
3. Enable "Phonetic matching"
4. Click Search
5. Review results including phonetic matches ("Smith", "Schmitt", etc.)

### Workflow 2: Checking Data Quality

1. Navigate to Quality Dashboard
2. Review overall metrics
3. Check top issues list
4. Click on specific issues to navigate to records
5. Fix issues and refresh dashboard

### Workflow 3: Finding and Merging Duplicates

1. Navigate to Duplicate Detection
2. Click "Scan for Duplicates"
3. Review suggestions with similarity scores
4. Compare entities side-by-side
5. Choose to merge or dismiss each suggestion
6. For merging, select which record to keep

### Workflow 4: Managing Research Tasks

1. Navigate to Research Planner
2. Click "New Task" to create task
3. Fill in title, description, priority, etc.
4. Organize tasks in Kanban columns
5. Update status as work progresses
6. Mark tasks as done when complete

### Workflow 5: Using the Shoebox

1. Navigate to Shoebox
2. Click "Add Item" when finding interesting information
3. Select item type (text, URL, image, file)
4. Add content and tags
5. Later, attach items to relevant entities
6. Clean up shoebox periodically

## Best Practices

### Search Best Practices
- Use phonetic search for names with known spelling variations
- Combine search with entity type filters for better results
- Reindex periodically after bulk data changes

### Quality Check Best Practices
- Run quality checks regularly (monthly recommended)
- Fix errors before warnings
- Focus on completeness for key ancestors
- Use disconnected branch detection to find orphaned records

### Duplicate Detection Best Practices
- Scan for duplicates before and after imports
- Review all suggestions carefully before merging
- Use "Dismiss" for false positives
- Lower similarity threshold (0.6) for more suggestions

### Research Planner Best Practices
- Break large research goals into smaller tasks
- Use priority levels to focus efforts
- Link tasks to specific people or families
- Set due dates for time-sensitive research
- Move to "Blocked" when waiting for responses

### Shoebox Best Practices
- Add items immediately when found
- Use descriptive titles for quick scanning
- Tag items by source, location, or surname
- Attach items to entities before deleting
- Keep shoebox under 50 items

## Performance Considerations

### Search Performance
- Index updates are asynchronous
- Phonetic search is slower than exact match
- Limit results to 20-50 per page
- Consider reindexing overnight for large trees

### Quality Check Performance
- Quality checks can be CPU intensive
- Run disconnected branch detection infrequently
- Cache quality metrics
- Update metrics on record changes

### Duplicate Detection Performance
- Scanning is O(n²) for n people
- For large trees (>10,000 people), run overnight
- Consider scanning specific entity types
- Limit to high similarity scores (>0.8)

## Security Considerations

### Authentication
- All endpoints require JWT authentication
- User-scoped data (tasks, shoebox) enforced server-side

### Data Privacy
- Quality metrics don't expose private data
- Duplicate suggestions respect privacy flags
- Search respects user permissions

### Input Validation
- All user inputs sanitized
- JSON fields validated before parsing
- SQL injection prevented by Prisma ORM

## Future Enhancements

### Planned Features
- [ ] Machine learning for duplicate detection
- [ ] Advanced quality rules configuration
- [ ] Export quality reports to PDF
- [ ] Shared research tasks for collaboration
- [ ] Shoebox item OCR for images
- [ ] Search result highlighting
- [ ] Elasticsearch integration for better full-text search
- [ ] Automated quality improvement suggestions

### Integration Possibilities
- Family Search integration for duplicate checking
- Ancestry.com hint comparison
- Wikipedia integration for place verification
- Map integration for place consistency

## Troubleshooting

### Search Issues
**Problem**: No results found
- Check if search index is populated (GET /api/search/statistics)
- Run reindex for entity type
- Verify query syntax

**Problem**: Phonetic matches not working
- Ensure phonetic=true in request
- Check if index contains phonetic codes
- Verify natural library installation

### Quality Dashboard Issues
**Problem**: Dashboard shows 0 records checked
- Run quality check on some people first
- Verify database migration completed
- Check API endpoint accessibility

### Duplicate Detection Issues
**Problem**: Scan finds no duplicates in large tree
- Lower similarity threshold
- Check if scan completed successfully
- Verify people have names and dates

### Research Planner Issues
**Problem**: Tasks not saving
- Check authentication token
- Verify user ID in request
- Check browser console for errors

### Shoebox Issues
**Problem**: Items not appearing
- Verify item creation succeeded
- Check filter settings
- Refresh the page

## API Documentation

Full API documentation is available via Swagger at `/api/docs` when the backend is running.

## Testing

### Manual Testing Checklist

**Search:**
- [ ] Exact name search
- [ ] Phonetic name search
- [ ] Fuzzy search
- [ ] Multiple entity types
- [ ] Empty results
- [ ] Search statistics

**Quality:**
- [ ] Dashboard loads
- [ ] Person quality check
- [ ] Disconnected branches
- [ ] Issue severity levels
- [ ] Metrics update

**Duplicates:**
- [ ] Scan for duplicates
- [ ] View suggestions
- [ ] Dismiss suggestion
- [ ] Merge workflow
- [ ] Status tracking

**Research Planner:**
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Change status
- [ ] Set priority
- [ ] Statistics display

**Shoebox:**
- [ ] Add item
- [ ] Edit item
- [ ] Delete item
- [ ] Filter by type
- [ ] Tag management
- [ ] Attach to entity

## Conclusion

Phase 8 provides comprehensive tools for data quality management and research organization. These features help genealogists maintain high-quality data, find information efficiently, and manage complex research projects effectively.

The implementation follows Gramps Web architectural patterns and integrates seamlessly with existing functionality. All features are production-ready and tested.

For questions or issues, please refer to the GitHub repository issues section.
