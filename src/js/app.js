import { initFileHandling, generateSQL } from './csvProcessor.js';
import { SnowflakeConnector } from './snowflakeConnector.js';

// Remove the initializeApp function wrapper and directly export the initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    
    // Initialize file handling functionality
    try {
        initFileHandling();
        console.log('File handling initialized successfully');
    } catch (error) {
        console.error('Error initializing file handling:', error);
    }
    
    // Set up input source toggle
    const fileSourceRadio = document.querySelector('input[name="inputSource"][value="file"]');
    const querySourceRadio = document.querySelector('input[name="inputSource"][value="query"]');
    const fileSection = document.getElementById('fileSection');
    const querySection = document.getElementById('querySection');
    
    if (fileSourceRadio && querySourceRadio && fileSection && querySection) {
        fileSourceRadio.addEventListener('change', () => {
            if (fileSourceRadio.checked) {
                fileSection.classList.remove('hidden');
                querySection.classList.add('hidden');
            }
        });
        
        querySourceRadio.addEventListener('change', () => {
            if (querySourceRadio.checked) {
                fileSection.classList.add('hidden');
                querySection.classList.remove('hidden');
            }
        });
    }
    
    // Initialize Snowflake connector for query mode
    const snowflake = new SnowflakeConnector();
    const executeSourceQuery = document.getElementById('executeSourceQuery');
    if (executeSourceQuery) {
        executeSourceQuery.addEventListener('click', async () => {
            const sourceQuery = document.getElementById('sourceQuery');
            if (sourceQuery && sourceQuery.value) {
                try {
                    // Show loading indicator
                    executeSourceQuery.textContent = 'Executing...';
                    executeSourceQuery.disabled = true;
                    
                    const results = await snowflake.executeQuery(sourceQuery.value);
                    
                    // Process results and update UI
                    if (results && results.length > 0) {
                        // Handle results here
                        console.log('Query results:', results);
                    } else {
                        alert('Query returned no results');
                    }
                } catch (error) {
                    console.error('Error executing query:', error);
                    alert('Error executing query: ' + error.message);
                } finally {
                    // Reset button state
                    executeSourceQuery.textContent = 'Execute Query';
                    executeSourceQuery.disabled = false;
                }
            }
        });
    }
    
    const generateBtn = document.getElementById('generateButton');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateSQL);
    } else {
        console.error('[app] #generateButton not found');
    }
});