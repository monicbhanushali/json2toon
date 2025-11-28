# JSON ↔ TOON Converter

A beautiful, fast, and SEO-optimized web application for converting between JSON and TOON (Token Oriented Object Notation) formats. Built with vanilla JavaScript for maximum performance and optimized for LLM use cases.

## 🌟 Features

- **Bidirectional Conversion**: Seamlessly convert from JSON to TOON and vice versa
- **Token Efficient**: Reduce LLM prompt tokens by ~40% compared to standard JSON
- **LLM Optimized**: Schema-aware format that models parse naturally with high accuracy
- **Elegant UI**: Minimalist, modern design with smooth animations
- **Privacy First**: All conversions happen in your browser - no server uploads
- **Mobile Responsive**: Works perfectly on all devices
- **SEO Optimized**: Built with search engine optimization in mind
- **AdSense Ready**: Pre-configured slots for Google AdSense monetization
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + Enter` to convert
- **Copy & Download**: Easy copy-to-clipboard and file download functionality

## 📊 What is TOON?

TOON (Token Oriented Object Notation) is a compact, human-readable encoding of the JSON data model designed specifically for Large Language Models. It achieves:

- **~40% fewer tokens** than standard JSON
- **74% accuracy** vs JSON's 70% in LLM retrieval benchmarks
- **Tabular arrays** that collapse uniform data into CSV-style tables
- **Schema guardrails** with explicit `[N]` lengths and `{fields}` headers

### Example

**JSON** (126 bytes, ~40 tokens):
```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}
```

**TOON** (64 bytes, ~24 tokens):
```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

## 🚀 Quick Start

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve .

# Live development with auto-reload
npm run dev
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
json-toon-converter/
├── index.html          # Main HTML file with SEO meta tags
├── styles.css          # Elegant, responsive CSS styling
├── app.js              # TOON encoder/decoder logic
├── package.json        # Project configuration
└── README.md           # This file
```

## 🔧 How It Works

### JSON to TOON Conversion

1. Parses JSON input using native `JSON.parse()`
2. Detects tabular arrays (uniform objects with same keys)
3. Encodes tabular arrays with `[N]{fields}:` header format
4. Uses indentation for nested structures (like YAML)
5. Minimizes quoting for clean, token-efficient output

### TOON to JSON Conversion

1. Custom TOON parser reads input line by line
2. Processes tabular array headers `[N]{field1,field2,...}:`
3. Parses CSV-style rows for tabular data
4. Handles nested objects with indentation
5. Outputs formatted JSON using `JSON.stringify()`

## 📚 Learn More About TOON

- [Official TOON Specification](https://github.com/toon-format/toon)
- [TOON Documentation](https://toonformat.dev/)
- [Benchmarks & Performance](https://toonformat.dev/guide/benchmarks)
- [LLM Integration Guide](https://toonformat.dev/guide/llm-prompts)

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Made with ❤️ for developers building with LLMs
