
// ChatGPT Watermark Removal API - SMART VERSION
// Fully production-ready serverless function for Vercel deployment

/**
 * Maps Unicode characters to human-readable names
 */
function getCharacterName(char) {
  const characterMap = {
    '\u202F': 'Narrow No-Break Space',
    '\u200B': 'Zero-Width Space',
    '\u2003': 'Em Space',
    '\u2014': 'Em Dash',
    '\u00A0': 'Non-Breaking Space',
    '\u2060': 'Word Joiner',
    '\u200C': 'Zero-Width Non-Joiner',
    '\u200D': 'Zero-Width Joiner',
    '\uFEFF': 'Zero-Width No-Break Space',
    '\u2028': 'Line Separator',
    '\u2029': 'Paragraph Separator',
    '\u180E': 'Mongolian Vowel Separator',
    '\u061C': 'Arabic Letter Mark',
    '\u00B7': 'Middle Dot'
  };
  
  return characterMap[char] || `Unknown Character (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * Removes ChatGPT watermarks from text and preserves intended word boundaries
 */
function removeWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalText = text;
  const originalLength = text.length;

  // Only target truly invisible/zero-width characters that are commonly used as watermarks
  const watermarkChars = [
    '\u200B', // Zero-Width Space - most common watermark
    '\u200C', // Zero-Width Non-Joiner
    '\u200D', // Zero-Width Joiner
    '\uFEFF', // Zero-Width No-Break Space (BOM)
    '\u2060', // Word Joiner
    '\u061C', // Arabic Letter Mark
    '\u180E'  // Mongolian Vowel Separator
  ];

  // Create regex that only matches the specific watermark characters
  const watermarkRegex = new RegExp(`[${watermarkChars.map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')).join('')}]`, 'g');

  const detectedWatermarks = [];
  let totalRemoved = 0;

  // Count occurrences of each watermark character
  watermarkChars.forEach(char => {
    const matches = text.match(new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g'));
    if (matches) {
      detectedWatermarks.push({
        character: char,
        name: getCharacterName(char),
        count: matches.length,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      });
      totalRemoved += matches.length;
    }
  });

  // Simple removal - just remove the watermark characters without replacement
  // Since these are zero-width/invisible characters, removing them shouldn't affect spacing
  let cleanedText = text.replace(watermarkRegex, '');

  // Only normalize excessive whitespace if we actually removed watermarks
  if (totalRemoved > 0) {
    // Clean up any double spaces that might have been created
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ').trim();
  }

  return {
    original: originalText,
    cleaned: cleanedText,
    stats: {
      originalLength,
      cleanedLength: cleanedText.length,
      charactersRemoved: totalRemoved,
      watermarksDetected: detectedWatermarks.length > 0,
      detectedWatermarks,
      processingTime: new Date().toISOString()
    }
  };
}

/**
 * Vercel Serverless API handler
 */
export default function handler(req, res) {
  // CORS headers for the free spirits out there
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight gets the red carpet
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST only — all else can go cry
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST is your ticket.',
      allowedMethods: ['POST']
    });
  }

  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        expectedFormat: {
          text: 'string - The text to clean'
        }
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text parameter is required',
        receivedData: req.body
      });
    }

    if (typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text parameter must be a string',
        receivedType: typeof text
      });
    }

    console.log(`Incoming text length: ${text.length}`);

    const result = removeWatermarks(text);

    console.log(`Cleaned! Removed ${result.stats.charactersRemoved} sneaky watermarks.`);

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      apiVersion: '1.1.0' // Bumped version for clarity
    });

  } catch (error) {
    console.error('🔥 Error detected:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error while nuking watermarks',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Export raw function for testing too
export { removeWatermarks };
