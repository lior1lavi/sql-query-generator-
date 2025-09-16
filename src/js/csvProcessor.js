let csvData = [];
let headers = [];

function initFileHandling() {
    console.log('[csv] initFileHandling');
    const fileInput = document.getElementById('csvFileInput');
    const generateBtn = document.getElementById('generateButton');
    
    if (!fileInput) {
        console.error('[csv] #csvFileInput not found');
        return;
    }
    
    if (!generateBtn) {
        console.error('[csv] #generateButton not found');
        return;
    }
    
    fileInput.addEventListener('change', handleFileUpload);
    generateBtn.addEventListener('click', generateSQL);
    
    console.log('[csv] Event listeners initialized');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        console.warn('[csv] No file selected');
        return; // FIX: previously missing, caused syntax error
    }
    console.log('[csv] File selected:', file.name);

    const isExcel = /\.xlsx?$/i.test(file.name);
    if (isExcel) {
        readExcel(file);
    } else {
        readTextCSV(file);
    }
}

function readTextCSV(file) {
    const reader = new FileReader();
    reader.onload = e => {
        processCSVData(e.target.result);
    };
    reader.onerror = err => console.error('[csv] FileReader error:', err);
    reader.readAsText(file);
}

function readExcel(file) {
    if (typeof XLSX === 'undefined') {
        console.error('[csv] XLSX library not loaded');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheet = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_csv(ws); // convert to CSV-like string
        processCSVData(json);
    };
    reader.readAsArrayBuffer(file);
}

function processCSVData(contents) {
    console.log('[csv] Processing CSV data');
    // Add debug logging
    console.log('[csv] Raw contents:', contents.substring(0, 100) + '...');
    
    // Normalize line endings
    contents = contents.replace(/\r\n?/g, '\n').trim();

    const lines = contents.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) {
        console.warn('[csv] Empty file');
        return;
    }

    // Add debug logging
    console.log('[csv] Number of lines:', lines.length);

    // Basic CSV split (handles simple quoted fields)
    headers = smartSplit(lines[0]);
    console.log('[csv] Headers found:', headers);

    populateColumnSelect(headers);

    csvData = lines.slice(1).map(line => smartSplit(line));
    console.log('[csv] Rows parsed:', csvData.length);

    // Make sure to call showPreview after data is processed
    showPreview();
}

function smartSplit(line) {
    // Simple CSV parsing respecting quotes
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' ) {
            if (inQuotes && line[i + 1] === '"') { // escaped quote
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function populateColumnSelect(headersArr) {
    const columnSelect = document.getElementById('columnSelect');
    if (!columnSelect) {
        console.error('[csv] #columnSelect not found');
        return;
    }
    columnSelect.innerHTML = '';

    const def = document.createElement('option');
    def.value = '';
    def.textContent = 'Select a column';
    columnSelect.appendChild(def);

    headersArr.forEach((h, idx) => {
        const opt = document.createElement('option');
        opt.value = idx.toString();
        opt.textContent = h || `Column ${idx+1}`;
        columnSelect.appendChild(opt);
    });

    console.log('[csv] Dropdown populated with', headersArr.length, 'columns');
}

function showPreview() {
    const previewDiv = document.getElementById('filePreview');
    if (!previewDiv) {
        console.error('[csv] #filePreview not found');
        return;
    }

    let html = '<table class="min-w-full text-sm text-left border border-gray-300">';
    
    // Add headers
    if (headers.length > 0) {
        html += '<thead><tr>' + 
                headers.map(h => `<th class="border px-2 py-1 bg-gray-100">${h}</th>`).join('') + 
                '</tr></thead>';
    }
    
    // Add data rows
    if (csvData.length > 0) {
        html += '<tbody>';
        const maxRows = Math.min(5, csvData.length);
        for (let r = 0; r < maxRows; r++) {
            html += '<tr>' + 
                    csvData[r].map(c => `<td class="border px-2 py-1">${c}</td>`).join('') + 
                    '</tr>';
        }
        html += '</tbody>';
    }
    
    html += '</table>';
    previewDiv.innerHTML = html;
    console.log('[csv] Preview table updated');
}

function formatValuesForSQL(values, operator, column) {
    console.log('[sql] Formatting values:', { values, operator, column });
    
    switch(operator.toUpperCase()) {
        case 'IN':
        case 'NOT IN': {
            // Check if values are numeric
            const numeric = values.every(v => !isNaN(Number(v)) && v.trim() !== '');
            const formattedValues = numeric ? 
                values.map(v => v.trim()) : 
                values.map(v => `'${v.replace(/'/g, "''").trim()}'`);
            return formattedValues.join(', ');  // Return only the formatted values
        }
        case 'LIKE':
        case 'NOT LIKE': {
            return values
                .map(v => `${column} ${operator} '%${v.replace(/'/g, "''").trim()}%'`)
                .join(' OR ');
        }
        default:
            console.error('[sql] Unsupported operator:', operator);
            return '';
    }
}

function constructFinalQuery(base, operator, column, formattedValues) {
    console.log('[sql] Constructing query:', { base, operator, column, formattedValues });
    
    let query = base.trim();
    
    // Handle IN/NOT IN clauses differently from LIKE/NOT LIKE
    let whereClause;
    if (operator === 'IN' || operator === 'NOT IN') {
        whereClause = `${column} ${operator} (${formattedValues})`;
    } else {
        whereClause = `(${formattedValues})`; // For LIKE, the column is already in formattedValues
    }
    
    if (query.length === 0) {
        query = `SELECT * FROM table_name WHERE ${whereClause}`;
    } else if (!query.toLowerCase().includes('where')) {
        query += ` WHERE ${whereClause}`;
    } else {
        query += ` AND ${whereClause}`;
    }
    
    // Ensure query ends with semicolon
    if (!query.endsWith(';')) {
        query += ';';
    }
    
    console.log('[sql] Final query:', query);
    return query;
}

function generateSQL() {
    console.log('[sql] Starting SQL generation...');
    
    const columnSelect = document.getElementById('columnSelect');
    const sqlOperator = document.getElementById('sqlOperator');
    const sqlQuery = document.getElementById('sqlQuery');
    const finalSqlOutput = document.getElementById('finalSql');
    
    if (!columnSelect || !sqlOperator || !sqlQuery || !finalSqlOutput) {
        console.error('[sql] Missing required elements:', {
            columnSelect: !!columnSelect,
            sqlOperator: !!sqlOperator,
            sqlQuery: !!sqlQuery,
            finalSqlOutput: !!finalSqlOutput
        });
        return;
    }
    
    if (!columnSelect?.value) {
        alert('Please select a column first');
        return;
    }
    
    const selectedIdx = parseInt(columnSelect.value);
    const operator = sqlOperator.value;
    const baseQuery = sqlQuery.value.trim();
    const selectedHeader = headers[selectedIdx];
    
    console.log('[sql] Parameters:', {
        selectedIdx,
        operator,
        baseQuery,
        selectedHeader
    });
    
    // Get unique values from selected column
    const values = [...new Set(csvData
        .map(row => row[selectedIdx])
        .filter(v => v != null && v.trim() !== '')
        .map(v => v.trim())
    )];
    
    if (values.length === 0) {
        alert('No values found in the selected column');
        return;
    }
    
    console.log('[sql] Found values:', values);
    
    const formatted = formatValuesForSQL(values, operator, selectedHeader);
    if (!formatted) {
        alert('Error formatting SQL values');
        return;
    }
    
    const finalQuery = constructFinalQuery(baseQuery, operator, selectedHeader, formatted);
    finalSqlOutput.value = finalQuery;
    
    console.log('[sql] Generation complete');
}

export { initFileHandling, generateSQL };