// API endpoint for scraping job descriptions from URLs
// Uses cheerio for HTML parsing

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
  res.setHeader('X-RateLimit-Limit', '10');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Build comprehensive browser-like headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    // Fetch the page
    const response = await fetch(url, {
      headers,
      redirect: 'follow',
    });

    // Handle common blocking responses
    if (response.status === 403) {
      return res.status(400).json({
        error: 'This site is blocking automated requests (403 Forbidden). Please copy the job description manually from the website.'
      });
    }

    if (response.status === 429) {
      return res.status(400).json({
        error: 'Too many requests. Please wait a moment and try again, or copy the job description manually.'
      });
    }

    if (!response.ok) {
      return res.status(400).json({
        error: `Failed to fetch URL: ${response.status} ${response.statusText}. Try copying the job description manually.`
      });
    }

    const html = await response.text();

    // Check if we got a login/auth page instead of content
    const authPageIndicators = [
      'sign in',
      'log in',
      'create account',
      'join now',
      'forgot password',
      'enter your password',
      'authentication required',
    ];

    const lowerHtml = html.toLowerCase();
    const isAuthPage = authPageIndicators.filter(indicator =>
      lowerHtml.includes(indicator)
    ).length >= 3;

    // LinkedIn-specific check
    const isLinkedIn = url.includes('linkedin.com');
    if (isLinkedIn && (isAuthPage || html.includes('authwall') || html.includes('login-email'))) {
      return res.status(400).json({
        error: 'LinkedIn requires sign-in to view job postings. Please copy the job description manually:\n\n1. Open the job in LinkedIn\n2. Click on the job to view details\n3. Select all text (Cmd+A or Ctrl+A)\n4. Copy and paste here'
      });
    }

    // Generic auth page detection
    if (isAuthPage) {
      return res.status(400).json({
        error: 'This page requires login to view. Please copy the job description manually from the website.'
      });
    }

    // Extract job description content
    const jobContent = extractJobContent(html);

    if (!jobContent || jobContent.length < 100) {
      return res.status(400).json({
        error: 'Could not extract job description from this URL. Try copying the text manually.'
      });
    }

    return res.status(200).json({
      success: true,
      content: jobContent,
      url: url
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch job posting. The site may be blocking automated requests.'
    });
  }
}

/**
 * Extract job description content from HTML
 * Uses multiple strategies to find the main content
 */
function extractJobContent(html) {
  // Remove script and style tags first
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Try to find common job description containers
  const containerPatterns = [
    // LinkedIn
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Indeed
    /<div[^>]*id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/gi,
    // Greenhouse
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/gi,
    // Lever
    /<div[^>]*class="[^"]*posting-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Workday
    /<div[^>]*data-automation-id="jobPostingDescription"[^>]*>([\s\S]*?)<\/div>/gi,
    // Generic job content
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
  ];

  let bestContent = '';

  for (const pattern of containerPatterns) {
    const matches = [...cleaned.matchAll(pattern)];
    for (const match of matches) {
      const content = stripHtml(match[1] || match[0]);
      if (content.length > bestContent.length && content.length < 50000) {
        bestContent = content;
      }
    }
  }

  // If no container found, try extracting from body
  if (bestContent.length < 200) {
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bestContent = stripHtml(bodyMatch[1]);
    }
  }

  // Clean up the text
  return cleanJobText(bestContent);
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html) {
  return html
    // Replace common block elements with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, '\n')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    // Remove remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, '')
    // Clean whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Clean and format job description text
 */
function cleanJobText(text) {
  // Remove common non-job content
  const removePatterns = [
    /cookie\s*(policy|consent|preferences)/gi,
    /privacy\s*policy/gi,
    /terms\s*(of\s*service|and\s*conditions)/gi,
    /sign\s*(in|up)\s*(to|with)/gi,
    /create\s*an?\s*account/gi,
    /subscribe\s*to/gi,
    /follow\s*us/gi,
    /share\s*(this|on)/gi,
    /apply\s*now\s*button/gi,
  ];

  let cleaned = text;
  for (const pattern of removePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Trim to reasonable length (max ~10000 chars)
  if (cleaned.length > 10000) {
    cleaned = cleaned.substring(0, 10000) + '...';
  }

  return cleaned.trim();
}
