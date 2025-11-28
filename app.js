// ===========================
// JSON ↔ TOON Converter App
// ===========================

class Converter {
    constructor() {
        this.inputFormat = 'json'; // Current input format
        this.initializeTheme();
        this.initializeElements();
        this.attachEventListeners();
        this.loadExampleData();
    }

    initializeTheme() {
        // Default to dark mode
        this.currentTheme = 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    initializeElements() {
        // Input/Output areas
        this.inputArea = document.getElementById('inputArea');
        this.outputArea = document.getElementById('outputArea');
        
        // Buttons
        this.jsonInputBtn = document.getElementById('jsonInputBtn');
        this.tomlInputBtn = document.getElementById('tomlInputBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyInputBtn = document.getElementById('copyInputBtn');
        this.copyOutputBtn = document.getElementById('copyOutputBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.themeText = document.getElementById('themeText');
        
        // Display elements
        this.outputFormat = document.getElementById('outputFormat');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Update theme toggle UI
        this.updateThemeToggle();
    }

    attachEventListeners() {
        // Format toggle buttons
        this.jsonInputBtn.addEventListener('click', () => this.setInputFormat('json'));
        this.tomlInputBtn.addEventListener('click', () => this.setInputFormat('toon'));
        
        // Action buttons
        this.convertBtn.addEventListener('click', () => this.convert());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyInputBtn.addEventListener('click', () => this.copyToClipboard(this.inputArea.value));
        this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard(this.outputArea.value));
        this.downloadBtn.addEventListener('click', () => this.downloadOutput());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convert();
                }
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        if (this.currentTheme === 'dark') {
            this.themeIcon.textContent = '☀️';
            this.themeText.textContent = 'Light';
        } else {
            this.themeIcon.textContent = '🌙';
            this.themeText.textContent = 'Dark';
        }
    }

    setInputFormat(format) {
        this.inputFormat = format;
        
        // Update button states
        if (format === 'json') {
            this.jsonInputBtn.classList.add('active');
            this.tomlInputBtn.classList.remove('active');
            this.tomlInputBtn.textContent = 'TOON';
            this.outputFormat.textContent = 'TOON';
        } else {
            this.tomlInputBtn.classList.add('active');
            this.jsonInputBtn.classList.remove('active');
            this.outputFormat.textContent = 'JSON';
        }
        
        // Update placeholder
        this.inputArea.placeholder = `Paste your ${format.toUpperCase()} here...`;
        this.hideError();
    }

    convert() {
        const input = this.inputArea.value.trim();
        
        if (!input) {
            this.showError('Please enter some data to convert.');
            return;
        }

        try {
            let output;
            
            if (this.inputFormat === 'json') {
                output = this.jsonToToon(input);
            } else {
                output = this.toonToJson(input);
            }
            
            this.outputArea.value = output;
            this.hideError();
            
            // Add success animation
            this.outputArea.style.animation = 'none';
            setTimeout(() => {
                this.outputArea.style.animation = 'slideDown 0.3s ease';
            }, 10);
            
        } catch (error) {
            this.showError(`Conversion error: ${error.message}`);
            this.outputArea.value = '';
        }
    }

    jsonToToon(jsonString) {
        const jsonObj = JSON.parse(jsonString);
        return this.encode(jsonObj);
    }

    toonToJson(toonString) {
        const toonObj = this.decode(toonString);
        return JSON.stringify(toonObj, null, 2);
    }

    // TOON Encoder - converts JSON object to TOON format
    encode(value, indent = 0) {
        const indentStr = '  '.repeat(indent);
        
        if (value === null) return 'null';
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'string') return this.encodeString(value);
        
        if (Array.isArray(value)) {
            return this.encodeArray(value, indent, indentStr);
        }
        
        if (typeof value === 'object') {
            return this.encodeObject(value, indent, indentStr);
        }
        
        return 'null';
    }

    encodeString(str) {
        // Check if string needs quoting
        if (this.needsQuoting(str)) {
            return JSON.stringify(str);
        }
        return str;
    }

    needsQuoting(str) {
        // String needs quoting if it contains special chars, whitespace, or looks like a number/boolean
        if (str === '' || str === 'null' || str === 'true' || str === 'false') return true;
        if (/^-?\d+(\.\d+)?$/.test(str)) return true;
        if (/[\n\r\t,:\[\]{}]/.test(str)) return true;
        if (/^\s|\s$/.test(str)) return true;
        return false;
    }

    encodeArray(arr, indent, indentStr) {
        if (arr.length === 0) return '[]';
        
        // Check if array is tabular (all elements are objects with same keys)
        if (this.isTabular(arr)) {
            return this.encodeTabularArray(arr, indent, indentStr);
        }
        
        // For non-tabular arrays, use standard format
        const lines = [];
        for (const item of arr) {
            const encoded = this.encode(item, indent + 1);
            lines.push(`${indentStr}  - ${encoded}`);
        }
        return '\n' + lines.join('\n');
    }

    isTabular(arr) {
        if (arr.length === 0) return false;
        if (!arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
            return false;
        }
        
        // Check if all objects have the same keys
        const firstKeys = Object.keys(arr[0]).sort().join(',');
        return arr.every(item => Object.keys(item).sort().join(',') === firstKeys);
    }

    encodeTabularArray(arr, indent, indentStr) {
        if (arr.length === 0) return '[]';
        
        const fields = Object.keys(arr[0]);
        const lines = [];
        
        // Header: [N]{field1,field2,...}:
        lines.push(`[${arr.length}]{${fields.join(',')}}:`);
        
        // Rows: value1,value2,...
        for (const item of arr) {
            const values = fields.map(field => this.encodeValue(item[field]));
            lines.push(`${indentStr}  ${values.join(',')}`);
        }
        
        return '\n' + lines.join('\n');
    }

    encodeValue(value) {
        if (value === null) return '';
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'string') return this.encodeString(value);
        if (Array.isArray(value)) return JSON.stringify(value);
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    encodeObject(obj, indent, indentStr) {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        
        const lines = [];
        for (const key of keys) {
            const value = obj[key];
            const encoded = this.encode(value, indent + 1);
            
            if (typeof value === 'object' && value !== null) {
                lines.push(`${indentStr}${key}:${encoded}`);
            } else {
                lines.push(`${indentStr}${key}: ${encoded}`);
            }
        }
        
        return indent === 0 ? lines.join('\n') : '\n' + lines.join('\n');
    }

    // TOON Decoder - converts TOON format to JSON object
    decode(toonString) {
        const lines = toonString.split('\n').map(line => ({
            original: line,
            trimmed: line.trim(),
            indent: line.length - line.trimStart().length
        }));
        
        const { value } = this.parseValue(lines, 0, 0);
        return value;
    }

    parseValue(lines, startIndex, baseIndent) {
        let index = startIndex;
        
        // Skip empty lines
        while (index < lines.length && lines[index].trimmed === '') {
            index++;
        }
        
        if (index >= lines.length) {
            return { value: null, nextIndex: index };
        }
        
        const line = lines[index];
        const content = line.trimmed;
        
        // Check for tabular array header: [N]{fields}:
        const tabularMatch = content.match(/^\[(\d+)\]\{([^}]+)\}:$/);
        if (tabularMatch) {
            return this.parseTabularArray(lines, index, tabularMatch);
        }
        
        // Check for array item: - value
        if (content.startsWith('- ')) {
            return this.parseArrayItems(lines, index, line.indent);
        }
        
        // Check for key-value pair
        const colonIndex = content.indexOf(':');
        if (colonIndex > 0) {
            const key = content.substring(0, colonIndex).trim();
            const valueStr = content.substring(colonIndex + 1).trim();
            
            if (valueStr === '') {
                // Multi-line value
                const { value, nextIndex } = this.parseValue(lines, index + 1, line.indent + 2);
                return {
                    value: { [key]: value },
                    nextIndex
                };
            } else {
                // Inline value
                const value = this.parseInlineValue(valueStr);
                return {
                    value: { [key]: value },
                    nextIndex: index + 1
                };
            }
        }
        
        // Standalone value
        return {
            value: this.parseInlineValue(content),
            nextIndex: index + 1
        };
    }

    parseTabularArray(lines, startIndex, match) {
        const count = parseInt(match[1]);
        const fields = match[2].split(',').map(f => f.trim());
        const result = [];
        
        let index = startIndex + 1;
        const baseIndent = lines[startIndex].indent;
        
        for (let i = 0; i < count && index < lines.length; i++) {
            while (index < lines.length && lines[index].trimmed === '') {
                index++;
            }
            
            if (index >= lines.length) break;
            
            const line = lines[index];
            if (line.indent <= baseIndent && line.trimmed !== '') break;
            
            const values = this.parseCsvLine(line.trimmed);
            const obj = {};
            
            for (let j = 0; j < fields.length; j++) {
                obj[fields[j]] = this.parseInlineValue(values[j] || '');
            }
            
            result.push(obj);
            index++;
        }
        
        return { value: result, nextIndex: index };
    }

    parseArrayItems(lines, startIndex, baseIndent) {
        const result = [];
        let index = startIndex;
        
        while (index < lines.length) {
            const line = lines[index];
            
            if (line.trimmed === '') {
                index++;
                continue;
            }
            
            if (line.indent < baseIndent) break;
            if (!line.trimmed.startsWith('- ')) break;
            
            const valueStr = line.trimmed.substring(2);
            result.push(this.parseInlineValue(valueStr));
            index++;
        }
        
        return { value: result, nextIndex: index };
    }

    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    parseInlineValue(str) {
        str = str.trim();
        
        if (str === '' || str === 'null') return null;
        if (str === 'true') return true;
        if (str === 'false') return false;
        if (str === '[]') return [];
        if (str === '{}') return {};
        
        // Try to parse as number
        if (/^-?\d+(\.\d+)?$/.test(str)) {
            const num = parseFloat(str);
            return Number.isInteger(num) && str.indexOf('.') === -1 ? parseInt(str) : num;
        }
        
        // Try to parse as JSON (for quoted strings, arrays, objects)
        if ((str.startsWith('"') && str.endsWith('"')) || 
            (str.startsWith('[') && str.endsWith(']')) ||
            (str.startsWith('{') && str.endsWith('}'))) {
            try {
                return JSON.parse(str);
            } catch {
                // Fall through to return as string
            }
        }
        
        return str;
    }

    clear() {
        this.inputArea.value = '';
        this.outputArea.value = '';
        this.hideError();
        this.inputArea.focus();
    }

    async copyToClipboard(text) {
        if (!text) {
            this.showError('Nothing to copy!');
            return;
        }

        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    textArea.remove();
                } catch (err) {
                    textArea.remove();
                    throw err;
                }
            }
            
            // Show temporary success message
            this.errorMessage.textContent = '✓ Copied to clipboard!';
            this.errorMessage.style.background = '#f0fdf4';
            this.errorMessage.style.borderColor = '#bbf7d0';
            this.errorMessage.style.color = '#16a34a';
            this.errorMessage.classList.add('show');
            
            setTimeout(() => {
                this.hideError();
                this.errorMessage.style.background = '';
                this.errorMessage.style.borderColor = '';
                this.errorMessage.style.color = '';
            }, 2000);
        } catch (err) {
            this.showError('Failed to copy to clipboard. Please copy manually.');
        }
    }

    downloadOutput() {
        const output = this.outputArea.value;
        
        if (!output) {
            this.showError('Nothing to download!');
            return;
        }

        const extension = this.inputFormat === 'json' ? 'toon' : 'json';
        const filename = `converted.${extension}`;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }

    loadExampleData() {
        // Load example JSON data showing TOON's strengths with tabular data
        const exampleJson = {
            "employees": [
                { "id": 1, "name": "Alice Johnson", "department": "Engineering", "salary": 85000, "active": true },
                { "id": 2, "name": "Bob Smith", "department": "Sales", "salary": 72000, "active": true },
                { "id": 3, "name": "Carol Davis", "department": "Engineering", "salary": 95000, "active": false }
            ],
            "company": {
                "name": "Tech Corp",
                "founded": 2015,
                "location": "San Francisco"
            }
        };
        
        this.inputArea.value = JSON.stringify(exampleJson, null, 2);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Converter();
});

// Google AdSense Integration Helper
// Uncomment and configure when you have your AdSense account
/*
function loadAdSense() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
}

// Initialize ads after page load
window.addEventListener('load', loadAdSense);
*/
