# Online Gambling Detector Extension

<div align="center">
<img src="https://c.tenor.com/us6mNEQpXX8AAAAd/tenor.gif" width="200"/>
</div>

<div align="justify" id="contributor">
  <strong>
    <h2>Contributor</h2>
    <table align="center">
      <tr align="center">
        <td></td>
        <td>NIM</td>
        <td>Nama</td>
      </tr>
      <tr align="center">
        <td><img src="https://github.com/achideon.png" width="50" /></td>
        <td>13524048</td>
        <td>Josh Reinhart Zidik</td>
      </tr>
      <tr align="center">
        <td><img src="https://github.com/Arbane557.png" width="50" /></td>
        <td>13524050</td>
        <td>Raysha Erviandika Putra</td>
      </tr>
      <tr align="center">
        <td><img src="https://github.com/naufalromi.png" width="50" /></td>
        <td>13524058</td>
        <td>Muhammad Naufal Romi Annafi</td>
      </tr>
    </table>
  </strong>
</div>

## Description

<p align="justify">
A <code>Chromium</code>-based browser extension designed to automatically detect and flag online gambling content on web pages. The extension uses multiple string-matching algorithms, including <code>Knuth-Morris-Pratt</code> (KMP), <code>Boyer-Moore</code> (BM), <code>Aho-Corasick</code>, <code>Rabin-Karp</code>, and fuzzy matching based on <code>Levenshtein Distance</code> to detect gambling-related keywords within webpage text. It is also capable of identifying keywords that use homoglyphs or visually similar character substitutions intended to evade detection. The extension includes a <b>keyword blurring feature</b> and an <b>OCR-based image text detector</b> for identifying gambling-related words embedded in images.
</p>

---
### Knuth-Morris-Pratt (KMP)

<p align="justify">
The Knuth-Morris-Pratt (KMP) algorithm is a string matching algorithm that preprocesses the pattern to build a border table, which stores information about repeating prefixes and suffixes. When a mismatch occurs, KMP uses this table to skip unnecessary comparisons, allowing it to find pattern occurrences in O(n + m) time.
</p>

**Read more: [Knuth-Morris-Pratt Algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm)**

### Boyer-Moore (BM)

<p align="justify">
The Boyer-Moore (BM) algorithm is a string matching algorithm that compares characters from right to left and uses a last occurrence table to determine how far the pattern can be shifted after a mismatch. By skipping portions of the text instead of checking every position, BM is often very efficient in practice, especially for long patterns.
</p>

**Read more: [Boyer-Moore Algorithm](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm)**

---
## Extension Setup

### Runtime Requirements
- **Google Chrome** (or any other **Chromium-based** browser such as Microsoft Edge, Brave, or Opera)
- **Node.js** (latest LTS version recommended)
- **Bun** (required for running tests)

### Installation

1. Install Node.js:
   - https://nodejs.org/

2. Install Bun:
   ```bash
   npm install -g bun
   ```

3. Install project dependencies:
   ```bash
   bun install
   ```

## Building the Extension

### Clone the Repository

```bash
git clone https://github.com/Arbane557/Tubes3_LET-IT-RIDE
```

### Navigate to the Project Directory

```bash
cd Tubes3_LET-IT-RIDE/judol-detector
```

### Development Build

```bash
bun run dev
```

or

```bash
vite build --watch
```

### Production Build

```bash
bun run build
```

or

```bash
vite build
```

The compiled extension will be generated inside the `/dist` directory.

## Running the Extension

1. Build the extension by following the steps above.
2. Open Chrome (or another Chromium-based browser) and navigate to the extensions page:

   For Chrome:
   ```
   chrome://extensions
   ```

   For Microsoft Edge:
   ```
   edge://extensions
   ```

3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the generated `dist/` folder.

The extension is now installed and ready to use.

## Hardware Requirements

### Minimum
- Dual-core processor
- 4 GB RAM
- 500 MB free storage

### Recommended
- Quad-core processor or better
- 8 GB RAM or more
- Modern Chromium browser

## Permissions

The extension may require:
- Access to webpage content for keyword detection.
- Access to images for OCR processing through Tesseract.js.
- Storage permission for saving extension settings and detection results (if implemented).

## Internet Connection

- Required for downloading dependencies during installation.
- Not required for keyword matching and OCR processing after installation, since Tesseract.js runs locally in the browser.
