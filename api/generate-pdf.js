// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PRODUCTION_URL || 'https://applytailor.com',
].filter(Boolean);

export default async function handler(req, res) {
  // CORS headers - restrict to allowed origins
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Rate limiting headers for Vercel
  res.setHeader('X-RateLimit-Limit', '20');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, filename = 'resume.pdf' } = req.body;

  // Validate input
  if (!html) {
    return res.status(400).json({ error: 'HTML content required' });
  }

  let browser = null;

  try {
    let puppeteer;
    let launchOptions;

    // Check if running on Vercel (production) or locally
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isVercel) {
      // Production: Use serverless-optimized Chromium
      const chromium = (await import('@sparticuz/chromium')).default;
      puppeteer = (await import('puppeteer-core')).default;

      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      // Local development: Use regular Puppeteer with bundled Chromium
      puppeteer = (await import('puppeteer')).default;

      launchOptions = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
    }

    // Launch browser
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Set the HTML content with proper wait conditions
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    // Wait for web fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Small delay to ensure all rendering is complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF with A4 format and full background colors
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    // Convert to base64 and send as JSON (more reliable for serverless)
    const pdfBase64 = Buffer.from(pdf).toString('base64');

    return res.status(200).json({
      pdf: pdfBase64,
      filename,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate PDF',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    // Ensure browser is always closed
    if (browser) {
      await browser.close();
    }
  }
}
