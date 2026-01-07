/**
 * Generate PDF via server-side API
 * @param {string} html - Full HTML document to render
 * @param {string} filename - Desired filename for the PDF
 * @returns {Promise<Blob>} - PDF blob for download
 */
export async function generatePdf(html, filename) {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ html, filename }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate PDF');
  }

  // Convert base64 to blob
  const binaryString = atob(data.pdf);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename to use
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build a complete HTML document from a DOM element
 * Captures all styles needed to render the element correctly
 * @param {HTMLElement} element - The element to convert
 * @returns {string} - Complete HTML document
 */
export function buildFullHtml(element) {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Remove any transform/scale applied for preview
  clone.style.transform = 'none';
  clone.style.boxShadow = 'none';

  // Collect all stylesheets from the document
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        // Cross-origin stylesheets can't be read - import them instead
        return sheet.href ? `@import url("${sheet.href}");` : '';
      }
    })
    .join('\n');

  // Build the complete HTML document
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
        <style>
          ${styles}
        </style>
        <style>
          @page {
            size: A4;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body > div {
            box-shadow: none !important;
          }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
    </html>
  `;
}
