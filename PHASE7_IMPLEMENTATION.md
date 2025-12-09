# Phase 7: Temporal Analysis (Timelines) - Implementation Guide

This document describes the implementation of Phase 7 features for Gramps Web, focusing on temporal analysis, interactive timelines, and age-related visualizations.

## Overview

Phase 7 adds comprehensive timeline and temporal analysis features to Gramps Web, enabling users to:
- View interactive person timelines with historical context
- Compare timelines of multiple ancestors side-by-side
- Analyze age statistics and lifespan data across generations
- Visualize historical events alongside personal life events
- Explore demographic patterns and generational trends

## Features Implemented

### 1. Interactive Person Timeline with Historical Context

**What it does:**
- Displays all life events for a person in chronological order
- Shows age at each event
- Integrates historical events that occurred during the person's lifetime
- Provides map view for events with location data
- Distinguishes between personal and historical events with visual styling

**Backend API:**
```javascript
GET /api/people/:handle/timeline?locale=en
```

**Response Format:**
```json
{
  "data": [
    {
      "gramps_id": "I0001_birth",
      "date": "January 15, 1920",
      "age": "",
      "label": "Birth",
      "description": "",
      "place": {
        "name": "New York, NY",
        "lat": 40.7128,
        "long": -74.0060
      },
      "type": "birth"
    },
    {
      "gramps_id": "historical_1941_Pearl_Harbor",
      "date": "December 7, 1941",
      "label": "Pearl Harbor",
      "description": "Attack on Pearl Harbor, U.S. enters WWII",
      "historical": true,
      "type": "historical",
      "role": "Military"
    }
  ]
}
```

**Historical Events Database:**
The system includes a curated database of ~40 major historical events spanning:
- 19th Century: Louisiana Purchase, Civil War, Industrial Revolution events
- 20th Century: World Wars, Space Race, Cold War, technological milestones
- 21st Century: 9/11, Financial Crisis, COVID-19 Pandemic

Events are categorized as:
- **Political**: Government changes, treaties, major legislation
- **Military**: Wars, battles, armistices
- **Economic**: Market crashes, economic milestones
- **Technology**: Inventions, space exploration
- **Health**: Major pandemics and health events

**Frontend Component:**
- `GrampsjsPersonTimeline` - Enhanced with historical event rendering
- Historical events styled with distinct background color and tertiary accent border
- Category badges for historical events
- Interactive map showing event locations
- Hover effects highlighting events on both timeline and map

**Usage:**
```javascript
// View accessed via person detail page
/person/[handle]/timeline
```

### 2. Comparative Timeline

**What it does:**
- Displays timelines for multiple people side-by-side
- Shows lifespan bars with visual scaling across a common time axis
- Marks major life events on each person's timeline
- Automatically calculates optimal year range to display all people
- Provides quick visual comparison of lifespans and major events

**Backend API:**
```javascript
GET /api/timelines/compare?handles=handle1,handle2,handle3
```

**Response Format:**
```json
{
  "data": [
    {
      "person": {
        "handle": "abc123",
        "gramps_id": "I0001",
        "name": "John Doe",
        "birth_date": "1920",
        "death_date": "1985"
      },
      "events": [
        {
          "gramps_id": "E0001",
          "date": "1920",
          "label": "Birth",
          "type": "birth"
        }
      ]
    }
  ]
}
```

**Frontend Component:**
- `GrampsjsComparativeTimeline` - New component with visual timeline bars
- Gradient lifespan bars showing birth to death
- Event markers positioned on timeline
- Year axis automatically scaled to data range
- Expandable event lists for each person

**Features:**
- **Visual Lifespan Bars**: Gradient-filled bars showing the span of each person's life
- **Event Markers**: Circular markers indicating major events (births, deaths, marriages)
- **Smart Scaling**: Automatically calculates min/max years and adds padding
- **Responsive Design**: Adapts to different screen sizes
- **Interactive**: Hover over markers to see event details

**Usage:**
```javascript
// View accessed via new route
/timelines/compare?handles=abc123,def456,ghi789
```

### 3. Age Analysis Dashboard

**What it does:**
- Calculates comprehensive age statistics across the family tree
- Shows average, median, min, and max lifespans
- Breaks down statistics by gender
- Shows distribution of people by birth century
- Displays lifespan distribution histogram

**Backend API:**
```javascript
// All people in tree
GET /api/timelines/age-analysis

// Specific people
GET /api/timelines/age-analysis?handles=handle1,handle2
```

**Response Format:**
```json
{
  "data": {
    "people": 150,
    "with_lifespan": 95,
    "average_lifespan": 72.5,
    "median_lifespan": 75,
    "max_lifespan": 98,
    "min_lifespan": 23,
    "by_gender": {
      "male": {
        "count": 50,
        "avg_lifespan": 70.2
      },
      "female": {
        "count": 45,
        "avg_lifespan": 74.8
      },
      "unknown": {
        "count": 0,
        "avg_lifespan": 0
      }
    },
    "by_century": {
      "1800": {
        "count": 25,
        "avg_lifespan": 0
      },
      "1900": {
        "count": 70,
        "avg_lifespan": 0
      }
    },
    "lifespans": [23, 45, 67, 72, 75, 78, 82, 85, 98]
  }
}
```

**Frontend Component:**
- `GrampsjsAgeAnalysis` - New dashboard component with multiple visualizations

**Visualizations:**

1. **Statistics Cards**:
   - Total people count
   - People with lifespan data (with percentage)
   - Average lifespan
   - Median lifespan with range

2. **Gender Analysis**:
   - Horizontal bar chart showing average lifespan by gender
   - Count of people per gender
   - Animated gradient bars with shimmer effect

3. **Century Distribution**:
   - Bar chart showing people count by birth century
   - Helps identify which generations have most data

4. **Lifespan Distribution Histogram**:
   - Visual histogram showing age ranges (0-20, 20-40, 40-60, etc.)
   - Helps identify patterns in mortality
   - Interactive hover tooltips

**Usage:**
```javascript
// View accessed via new route
/timelines/age-analysis

// Or filtered by specific people
/timelines/age-analysis?handles=abc123,def456
```

## Technical Implementation

### Backend Architecture

**Service Layer:**
- `TimelineService` - Core service handling all timeline logic
- Integrated with `PeopleService` for data retrieval
- Uses Prisma ORM for database queries

**Key Methods:**
```typescript
async getPersonTimeline(handle: string, locale: string)
async getComparativeTimeline(handles: string[])
async getAgeAnalysis(handles?: string[])
```

**Data Processing:**
- Birth/death events automatically extracted from person records
- Database events queried and formatted
- Historical events filtered by person's lifetime
- All events sorted chronologically
- Age calculations handle various date formats (year only, full dates)

### Frontend Architecture

**Component Structure:**
```
src/components/
├── GrampsjsPersonTimeline.js      (Enhanced)
├── GrampsjsComparativeTimeline.js (New)
└── GrampsjsAgeAnalysis.js        (New)

src/views/
├── GrampsjsViewPersonTimeline.js     (Existing)
├── GrampsjsViewComparativeTimeline.js (New)
└── GrampsjsViewAgeAnalysis.js        (New)
```

**Styling:**
- Material Design 3 color tokens for theming
- CSS Grid and Flexbox for responsive layouts
- CSS custom properties for easy customization
- Gradient effects for visual appeal
- Smooth transitions and animations

**State Management:**
- Lit Element reactive properties
- AppState mixin for API calls
- Local state for UI interactions

## Advanced Features

### Date Handling

The system handles multiple date formats:
- **Year only**: `"1920"`
- **ISO date**: `"1920-01-15"`
- **Display format**: `"January 15, 1920"`

Date parsing is flexible and handles missing data gracefully.

### Age Calculation

```typescript
// Smart age calculation
- Handles year-only dates (estimates based on year difference)
- Handles full dates (calculates precise age)
- Validates reasonable lifespans (filters out data errors > 120 years)
```

### Historical Context Integration

Historical events are:
- Filtered to match person's lifetime
- Categorized by type (Political, Military, Economic, etc.)
- Styled distinctly to differentiate from personal events
- Enriched with descriptions for context

### Performance Optimizations

- **Lazy Loading**: Timeline data loaded on demand
- **Efficient Queries**: Database queries optimized with proper indexes
- **Caching**: Frontend components cache rendered data
- **Pagination Ready**: API supports pagination (not yet implemented in UI)

## Usage Examples

### Example 1: Viewing a Person's Timeline

```javascript
// Navigate to person's timeline
window.location.href = '/person/abc123def456/timeline'

// Timeline displays:
// - Birth event (1920)
// - Historical: Great Depression begins (1929) - Age 9
// - Marriage event (1942) - Age 22
// - Historical: WWII ends (1945) - Age 25
// - Death event (1985) - Age 65
```

### Example 2: Comparing Multiple Ancestors

```javascript
// Compare grandfather, father, and yourself
const handles = ['grandfather_handle', 'father_handle', 'my_handle']
window.location.href = `/timelines/compare?handles=${handles.join(',')}`

// Shows three horizontal timelines:
// - Grandfather: 1890-1970 (80 years)
// - Father: 1920-1995 (75 years)  
// - You: 1950-present (75 years so far)
```

### Example 3: Analyzing Family Longevity

```javascript
// View age analysis for entire tree
window.location.href = '/timelines/age-analysis'

// Dashboard shows:
// - Average lifespan: 72.5 years
// - Males: 70.2 years average (50 people)
// - Females: 74.8 years average (45 people)
// - Most people born in 1900s
// - Most lived 60-80 years
```

## API Reference

### GET /api/people/:handle/timeline

**Parameters:**
- `handle` (path) - Person handle
- `locale` (query, optional) - Locale for date formatting (default: 'en')

**Response:** `{data: TimelineEvent[]}`

### GET /api/timelines/compare

**Parameters:**
- `handles` (query, required) - Comma-separated list of person handles

**Response:** `{data: PersonTimeline[]}`

### GET /api/timelines/age-analysis

**Parameters:**
- `handles` (query, optional) - Comma-separated list of person handles to analyze

**Response:** `{data: AgeAnalysisData}`

## Future Enhancements

### Planned Features:
1. **Export Functionality**: Export timelines as PDF or images
2. **Filtering**: Filter historical events by category
3. **Custom Events**: Add custom historical events
4. **Zoom Controls**: Zoom in/out on timeline view
5. **Drag to Scroll**: Horizontal scrolling for long timelines
6. **Print Optimization**: Print-friendly timeline layouts
7. **Sharing**: Share timeline URLs with specific filters
8. **Annotations**: Add personal notes to historical events
9. **Interactive Timeline**: Click and drag timeline bars
10. **More Visualizations**: Sankey diagrams for migration patterns

### Integration Opportunities:
- **Maps**: Deep integration with map views (Phase 6)
- **Charts**: Timeline data in relationship charts (Phase 5)
- **Reports**: Generate timeline reports
- **Media**: Link photos to timeline events
- **Stories**: Narrative timeline with media integration

## Testing

### Manual Testing Checklist:

**Person Timeline:**
- [ ] Timeline loads for person with events
- [ ] Historical events appear correctly
- [ ] Age calculations are accurate
- [ ] Map shows event locations
- [ ] Hover effects work
- [ ] Details button navigates to event
- [ ] Historical events styled differently
- [ ] Category badges display correctly

**Comparative Timeline:**
- [ ] Multiple people display correctly
- [ ] Lifespan bars scale properly
- [ ] Event markers appear at correct positions
- [ ] Year axis adjusts to data range
- [ ] Event lists expand/collapse
- [ ] Responsive on mobile

**Age Analysis:**
- [ ] Statistics calculate correctly
- [ ] Gender breakdown accurate
- [ ] Century distribution shows data
- [ ] Histogram displays properly
- [ ] Handles edge cases (no data, single person)
- [ ] Percentages calculate correctly

### API Testing:

```bash
# Test person timeline
curl http://localhost:3000/api/people/abc123/timeline?locale=en

# Test comparative timeline
curl http://localhost:3000/api/timelines/compare?handles=abc123,def456

# Test age analysis
curl http://localhost:3000/api/timelines/age-analysis
```

## Troubleshooting

### Common Issues:

**Issue**: Timeline shows no events
- **Solution**: Ensure person has birth/death dates or database events

**Issue**: Historical events not appearing
- **Solution**: Check that person has valid birth year for filtering

**Issue**: Age calculations incorrect
- **Solution**: Verify date formats in database (YYYY or YYYY-MM-DD)

**Issue**: Comparative timeline bars overlap
- **Solution**: Reduce number of people or expand view

**Issue**: Age analysis shows 0 people with lifespan
- **Solution**: People need both birth and death dates populated

## Conclusion

Phase 7 successfully implements comprehensive temporal analysis features for Gramps Web, providing powerful tools for genealogical research and family history visualization. The combination of personal timelines, historical context, comparative views, and statistical analysis offers unprecedented insight into family patterns across generations.
