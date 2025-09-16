# SQL IN-Clause Generator

## Overview
The SQL IN-Clause Generator is a web-based tool that helps generate SQL IN clauses from CSV or Excel files. It streamlines the process of creating SQL queries by automatically formatting data into proper SQL syntax.

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- Modern web browser (Chrome, Firefox, Safari)

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/your-username/sql-query-generator-.git
cd sql-query-generator-

# Install dependencies
npm install

# Start the application
npm start
```

## Usage Guide

### File Upload Mode
1. **Upload File**
   - Click "Choose file" button
   - Select a CSV or Excel file
   - Supported formats: .csv, .xlsx, .xls

2. **Preview Data**
   - After upload, preview table shows first 5 rows
   - Verify column headers and data

3. **Generate SQL**
   - Select target column from dropdown
   - Choose SQL operator (IN, NOT IN, LIKE, NOT LIKE)
   - (Optional) Enter base SQL query
   - Click "Generate Final SQL"
   - Copy generated SQL from output field

### Features
- Supports CSV and Excel files
- Auto-detects column headers
- Handles quoted strings
- Supports multiple SQL operators
- Preserves existing SQL query structure
- Deduplicates values automatically

### File Format Requirements
- First row must contain column headers
- CSV files should use comma (,) as separator
- Excel files should have data in first sheet
- Empty rows are automatically skipped

## Technical Details

### Project Structure
```
sql-query-generator-/
├── src/
│   ├── index.html
│   ├── assets/
│   │   └── styles/
│   │       └── main.css
│   └── js/
│       ├── app.js
│       └── csvProcessor.js
├── package.json
└── README.md
```

### Key Components
- **app.js**: Main application initialization
- **csvProcessor.js**: File processing and SQL generation
- **main.css**: Styling with Tailwind CSS

### Supported SQL Operators
- `IN`: Matches exact values
- `NOT IN`: Excludes exact values
- `LIKE`: Pattern matching with wildcards
- `NOT LIKE`: Exclude pattern matches

### Example Usage
```csv
account_name,region,status
Acme Corp,US,active
Beta Inc,EU,pending
```

```sql
SELECT * FROM table_name 
WHERE account_name IN ('Acme Corp', 'Beta Inc');
```

## Troubleshooting

### Common Issues
1. **File Not Loading**
   - Verify file format (.csv, .xlsx, .xls)
   - Check file isn't corrupted
   - File size should be under 10MB

2. **SQL Generation Failed**
   - Ensure column is selected
   - Verify data contains non-empty values
   - Check base query syntax if provided

3. **Preview Not Showing**
   - Clear browser cache
   - Try different browser
   - Check file encoding (UTF-8 recommended)

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## Support
For issues or questions:
1. Check existing GitHub issues
2. Create new issue with:
   - Browser version
   - File format/sample
   - Error messages
   - Expected vs actual behavior

## License
MIT License - Feel free to use and modify as needed.

---
*Note: Replace placeholder URLs and customize contact information as needed for your team.*