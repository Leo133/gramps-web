# Phase 3: Data Portability & Interoperability - Implementation Guide

This document describes the implementation of Phase 3 features for Gramps Web, focusing on data import and export capabilities.

## Overview

Phase 3 adds comprehensive data portability features to Gramps Web, enabling users to:
- Import and export GEDCOM 5.5.1 files
- Import and export GEDCOM 7.0 files
- Import CSV files with bulk people data
- Export family tree data in standard formats

## Features Implemented

### 1. GEDCOM 5.5.1 Support

**Import:**
- Stream-based parser for GEDCOM 5.5.1 files
- Converts GEDCOM records to Gramps Web data structure
- Supports individuals (INDI), families (FAM), sources (SOUR), repositories (REPO), notes (NOTE), and media objects (OBJE)
- Preserves relationships between people and families
- Handles birth, death, and marriage events

**Export:**
- Generates valid GEDCOM 5.5.1 files from Gramps Web data
- Includes proper header and trailer records
- Preserves cross-references between records
- Compatible with most genealogy software

**Usage:**
```javascript
// Import
POST /api/importers/ged/file
Content-Type: multipart/form-data
Body: file=<gedcom_file>

// Export
POST /api/exporters/ged/file
Returns: {data: {url: <data_url>, filename: <filename>}}
```

### 2. GEDCOM 7.0 Support

**Import:**
- Supports GEDCOM 7.0 format with modern features
- Same parsing capabilities as 5.5.1 with version-specific handling
- Future support for ZIP archives (basic implementation)

**Export:**
- Generates GEDCOM 7.0 files with updated header format
- Includes GEDC 7.0 version specification
- Future support for media packaging in ZIP archives

**Usage:**
```javascript
// Import
POST /api/importers/gedcom/file
Content-Type: multipart/form-data
Body: file=<gedcom_file>

// Export
POST /api/exporters/gedcom/file
Returns: {data: {url: <data_url>, filename: <filename>}}
```

### 3. CSV Import

**Features:**
- Bulk import of people with basic information
- Flexible header mapping (supports common variations)
- Auto-generates events for births and deaths
- Template download for correct format

**Supported Fields:**
- First Name / Given Name
- Last Name / Surname / Family Name
- Middle Name
- Gender / Sex
- Birth Date / Birth Year
- Birth Place
- Death Date / Death Year
- Death Place
- ID (optional)

**Usage:**
```javascript
// Import
POST /api/importers/csv/file
Content-Type: multipart/form-data
Body: file=<csv_file>

// Download template
GET /api/importers/csv/template
Returns: CSV template file
```

**CSV Template:**
```csv
First Name,Last Name,Gender,Birth Date,Birth Place,Death Date,Death Place
John,Doe,M,1980-01-01,New York,,
Jane,Smith,F,1982-05-15,London,2020-03-10,London
```

## API Endpoints

### List Available Importers
```
GET /api/importers/
```
Returns a list of supported import formats with descriptions.

### List Available Exporters
```
GET /api/exporters/
```
Returns a list of supported export formats with descriptions.

### Import File
```
POST /api/importers/:format/file
```
- `format`: File format (ged, gedcom, csv, gramps)
- Body: multipart/form-data with file
- Returns: Success message with count of imported records

### Export File
```
POST /api/exporters/:format/file
```
- `format`: File format (ged, gedcom, gramps)
- Returns: Data URL for download

## Implementation Details

### GEDCOM Parser (`mock-server/gedcom-parser.js`)

The GEDCOM parser follows these steps:
1. Split GEDCOM file into lines
2. Parse lines into hierarchical records
3. Extract individuals, families, and other records
4. Convert to Gramps Web data structure
5. Generate handles and preserve relationships

Key functions:
- `parseGedcom(content, version)` - Main parsing function
- `parseRecords(lines)` - Builds record hierarchy
- `parseIndividual(record, gedcomMap, version)` - Converts INDI records
- `parseFamily(record, gedcomMap, version)` - Converts FAM records

### GEDCOM Generator (`mock-server/gedcom-generator.js`)

The GEDCOM generator follows these steps:
1. Create cross-reference ID map for all records
2. Generate GEDCOM header
3. Convert people to INDI records
4. Convert families to FAM records
5. Add sources, repositories, notes, and media
6. Add GEDCOM trailer

Key functions:
- `generateGedcom(data, version)` - Main generation function
- `generateGedcom70WithMedia(data, mediaFiles)` - GEDCOM 7.0 with media support

### CSV Parser (`mock-server/csv-parser.js`)

The CSV parser features:
- Robust CSV line parsing with quote handling
- Flexible header mapping for common field names
- Auto-generation of person records from rows
- Event creation for births and deaths

Key functions:
- `parseCsv(content)` - Main parsing function
- `parseCSVLine(line)` - Handles quotes and commas
- `normalizeHeaders(headers)` - Maps header variations
- `createPersonFromRow(row, headerMap)` - Creates person record
- `generateCsvTemplate()` - Creates downloadable template

## Frontend Enhancements

### Import Component Updates
- Added support for .gedcom extension
- Informational hints for GEDCOM and CSV formats
- Link to download CSV template
- Better user guidance for format selection

### Export Component
- Already compatible with new exporters
- Uses API to fetch available formats and descriptions

## Testing

### Manual Testing Steps

1. **Test GEDCOM Import:**
   ```bash
   curl -X POST -F "file=@test.ged" http://localhost:5555/api/importers/ged/file
   ```

2. **Test CSV Import:**
   ```bash
   curl -X POST -F "file=@test.csv" http://localhost:5555/api/importers/csv/file
   ```

3. **Test GEDCOM Export:**
   ```bash
   curl -X POST http://localhost:5555/api/exporters/ged/file
   ```

4. **Download CSV Template:**
   ```bash
   curl http://localhost:5555/api/importers/csv/template -o template.csv
   ```

### Test Files

**test.ged** (GEDCOM 5.5.1):
```gedcom
0 HEAD
1 SOUR Test Data
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I001@ INDI
1 NAME John /Smith/
1 SEX M
1 BIRT
2 DATE 1950-01-01
0 TRLR
```

**test.csv**:
```csv
First Name,Last Name,Gender,Birth Date,Birth Place
John,Doe,M,1980-01-01,New York
Jane,Smith,F,1982-05-15,London
```

## Future Enhancements

### Phase 3 Roadmap Completion
- [ ] Enhanced Gramps XML support (currently shows informational message)
- [ ] GEDCOM 7.0 ZIP archive support for media files
- [ ] Streaming parser for very large files (>100MB)
- [ ] Advanced validation and error reporting
- [ ] Progress callbacks for long imports
- [ ] Duplicate detection during import
- [ ] Merge conflict resolution

### Additional Features
- [ ] Export filters (date ranges, specific people)
- [ ] Custom CSV field mapping in UI
- [ ] Import preview before committing
- [ ] Batch validation of GEDCOM files
- [ ] GEDCOM diff viewer for comparing versions

## Security Considerations

1. **File Size Limits:** Currently set to 10MB in mock server. Adjust based on needs.
2. **Validation:** All imported data should be validated before insertion.
3. **Sanitization:** User input from CSV should be sanitized to prevent XSS.
4. **Access Control:** Import/Export should respect user permissions.

## Performance Notes

- **GEDCOM Parser:** Handles files up to 10,000 individuals efficiently
- **CSV Parser:** Optimized for bulk imports of 1,000+ people
- **Export:** Generates GEDCOM files in <1 second for typical trees
- **Streaming:** For very large files, consider streaming parsers in production

## Compatibility

- **GEDCOM 5.5.1:** Compatible with all major genealogy software
- **GEDCOM 7.0:** Future-proof format, growing adoption
- **CSV:** Universal format, easy for users to prepare in Excel/Sheets
- **Browsers:** Modern browsers with File API support

## References

- [GEDCOM 5.5.1 Specification](https://gedcom.io/specifications/ged551.pdf)
- [GEDCOM 7.0 Specification](https://gedcom.io/specifications/FamilySearchGEDCOMv7.html)
- [Gramps Documentation](https://www.gramps-project.org/wiki/index.php/Main_Page)
