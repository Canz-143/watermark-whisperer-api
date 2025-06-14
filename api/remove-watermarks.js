
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
    '\u00B7': 'Middle Dot',
    '\u2011': 'Non-Breaking Hyphen',
    '\u034F': 'Combining Grapheme Joiner',
    '\u200A': 'Hair Space',
    '\u2008': 'Punctuation Space'
  };
  
  return characterMap[char] || `Unknown Character (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * Removes ChatGPT watermarks from text using comprehensive detection and simple cleaning
 */
function removeWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalText = text;
  const originalLength = text.length;

  // Comprehensive list of all invisible/zero-width watermark characters
  const invisibleWatermarkChars = [
    '\u200B', // Zero-Width Space - most common watermark
    '\u200C', // Zero-Width Non-Joiner
    '\u200D', // Zero-Width Joiner
    '\uFEFF', // Zero-Width No-Break Space (BOM)
    '\u2060', // Word Joiner
    '\u061C', // Arabic Letter Mark
    '\u180E', // Mongolian Vowel Separator
    '\u034F'  // Combining Grapheme Joiner
  ];

  // Legitimate spacing characters that should be converted to normal spaces
  const spacingChars = [
    '\u202F', // Narrow No-Break Space
    '\u2003', // Em Space
    '\u00A0', // Non-Breaking Space
    '\u2028', // Line Separator
    '\u2029', // Paragraph Separator
    '\u2011', // Non-Breaking Hyphen (sometimes used as separator)
    '\u200A', // Hair Space
    '\u2008'  // Punctuation Space
  ];

  // All watermark characters for detection and counting
  const allWatermarkChars = [...invisibleWatermarkChars, ...spacingChars];

  const detectedWatermarks = [];
  let totalRemoved = 0;

  // Count occurrences of each watermark character
  allWatermarkChars.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    const matches = text.match(charRegex);
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

  console.log(`Input text analysis:`, {
    length: originalLength,
    detectedWatermarks: detectedWatermarks,
    totalToRemove: totalRemoved
  });

  let cleanedText = text;

  // Step 1: Remove all invisible watermark characters completely
  invisibleWatermarkChars.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    cleanedText = cleanedText.replace(charRegex, '');
  });

  // Step 2: Replace all spacing characters with normal spaces
  spacingChars.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    cleanedText = cleanedText.replace(charRegex, ' ');
  });

  // Step 3: Clean up multiple consecutive spaces
  cleanedText = cleanedText.replace(/\s{2,}/g, ' ');

  // Step 4: Clean up spaces around punctuation if needed
  cleanedText = cleanedText.replace(/\s+([.,!?;:])/g, '$1');
  cleanedText = cleanedText.replace(/([.,!?;:])\s{2,}/g, '$1 ');

  // Step 5: Trim leading/trailing whitespace
  cleanedText = cleanedText.trim();

  console.log(`Processing complete:`, {
    originalLength,
    cleanedLength: cleanedText.length,
    charactersRemoved: totalRemoved,
    cleanedText: cleanedText.substring(0, 100) + (cleanedText.length > 100 ? '...' : '')
  });

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
