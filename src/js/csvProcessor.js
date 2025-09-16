export let fileData = null;

export function initFileHandling() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        throw new Error('File input element not found');
    }
    fileInput.addEventListener('change', handleFileUpload);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            processFileData(file, e.target.result);
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file: ' + error.message);
        }
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
        reader.readAsArrayBuffer(file);
    }
}

function processFileData(file, data) {
    try {
        let headers, rows;
        
        if (file.name.endsWith('.csv')) {
            const lines = data.split('\n');
            headers = lines[0].split(',').map(h => h.trim());
            rows = lines.slice(1)
                .filter(line => line.trim())
                .map(line => line.split(',').map(cell => cell.trim()));
        } else if (file.name.match(/\.(xlsx|xls)$/)) {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            headers = jsonData[0];
            rows = jsonData.slice(1);
        }

        fileData = { headers, rows };
        updateUI(headers, rows);
    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file: ' + error.message);
    }
}

function handleColumnSelection(event) {
    const selectedColumn = event.target.value;
    const generateButton = document.getElementById('generateButton');
    const sqlQuery = document.getElementById('sqlQuery');
    
    if (selectedColumn && fileData && generateButton && sqlQuery?.value) {
        generateButton.disabled = false;
    } else if (generateButton) {
        generateButton.disabled = true;
    }
}

document.getElementById('sqlQuery')?.addEventListener('input', (event) => {
    const generateButton = document.getElementById('generateButton');
    const columnSelect = document.getElementById('columnSelect');
    
    if (event.target.value && columnSelect?.value && fileData) {
        generateButton.disabled = false;
    } else if (generateButton) {
        generateButton.disabled = true;
    }
});

function updateUI(headers, rows) {
    updatePreview(headers, rows);
    updateColumnSelect(headers);
}

function updatePreview(headers, rows) {
    const headerRow = document.getElementById('previewHeader');
    const previewBody = document.getElementById('previewBody');

    if (!headerRow || !previewBody) return;

    headerRow.innerHTML = '';
    previewBody.innerHTML = '';

    headers.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = header || '';
        headerRow.appendChild(th);
    });

    rows.slice(0, 5).forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach((_, index) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
            td.textContent = row[index] || '';
            tr.appendChild(td);
        });
        previewBody.appendChild(tr);
    });
}

function updateColumnSelect(headers) {
    const columnSelect = document.getElementById('columnSelect');
    if (!columnSelect) return;

    columnSelect.innerHTML = '<option value="">Select a column</option>';
    
    headers.forEach(header => {
        if (header && header.trim()) {
            const option = document.createElement('option');
            option.value = header.trim();
            option.textContent = header.trim();
            columnSelect.appendChild(option);
        }
    });

    columnSelect.disabled = false;
}

// Add delimiter change handler
document.getElementById('delimiterSelect')?.addEventListener('change', (event) => {
    const customDelimiterInput = document.getElementById('customDelimiter');
    if (event.target.value === 'custom') {
        customDelimiterInput.classList.remove('hidden');
    } else {
        customDelimiterInput.classList.add('hidden');
    }
    
    if (fileData) {
        const file = document.getElementById('fileInput').files[0];
        if (file) {
            handleFileUpload({ target: { files: [file] } });
        }
    }
});