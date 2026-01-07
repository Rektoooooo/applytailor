import { useState, useCallback } from 'react';
import { generatePdf, downloadBlob, buildFullHtml } from '../../lib/pdfApi';

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportToPdf = useCallback(async (elementRef, filename = 'resume.pdf') => {
    if (!elementRef?.current) {
      setError('No element to export');
      return false;
    }

    setExporting(true);
    setError(null);

    try {
      const element = elementRef.current;

      // Wait for fonts to be ready
      await document.fonts.ready;

      // Build complete HTML document from the element
      const html = buildFullHtml(element);

      // Generate PDF via server API
      const blob = await generatePdf(html, filename);

      // Download the PDF
      downloadBlob(blob, filename);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to export PDF');
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportToPdf, exporting, error };
}
