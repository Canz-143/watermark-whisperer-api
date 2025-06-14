// ChatGPT Watermark Removal API - FIXED VERSION
// Production-ready serverless function for Vercel deployment

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
 * Removes ChatGPT watermarks from text and provides detailed statistics
 * IMPROVED: Now properly handles different watermark placement scenarios
 */
function removeWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalText = text;
  const originalLength = text.length;
  
  // Define all known ChatGPT watermark characters
  const watermarkChars = [
    '\u202F', // Narrow No-Break Space
    '\u200B', // Zero-Width Space
    '\u2003', // Em Space
    '\u2014', // Em Dash
    '\u00A0', // Non-Breaking Space
    '\u2060', // Word Joiner
    '\u200C', // Zero-Width Non-Joiner
    '\u200D', // Zero-Width Joiner
    '\uFEFF', // Zero-Width No-Break Space
    '\u2028', // Line Separator
    '\u2029', // Paragraph Separator
    '\u180E', // Mongolian Vowel Separator
    '\u061C', // Arabic Letter Mark
    '\u00B7'  // Middle Dot
  ];
  
  // Track detected watermarks
  const detectedWatermarks = [];
  let totalRemoved = 0;
  
  // Count and track each watermark character
  watermarkChars.forEach(char => {
    const matches = text.match(new RegExp(char, 'g'));
    const count = matches ? matches.length : 0;
    if (count > 0) {
      detectedWatermarks.push({
        character: char,
        name: getCharacterName(char),
        count: count,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      });
      totalRemoved += count;
    }
  });
  
  // IMPROVED APPROACH: Handle different watermark placement scenarios
  let cleanedText = text;
  
  // Step 1: Replace watermark characters with a temporary marker
  const tempMarker = '|||SPACE|||';
  watermarkChars.forEach(char => {
    cleanedText = cleanedText.replace(new RegExp(char, 'g'), tempMarker);
  });
  
  // Step 2: Analyze patterns and restore proper spacing
  // If we have sequences like "word|||SPACE|||word" without actual spaces, add spaces
  cleanedText = cleanedText.replace(/([a-zA-Z0-9])\|\|\|SPACE\|\|\|([a-zA-Z0-9])/g, '$1 $2');
  
  // Step 3: Remove remaining temporary markers (these were likely within words or redundant)
  cleanedText = cleanedText.replace(/\|\|\|SPACE\|\|\|/g, '');
  
  // Step 4: Clean up any resulting multiple spaces
  cleanedText = cleanedText.replace(/\s+/g, ' ');
  
  // Step 5: Trim leading and trailing whitespace
  cleanedText = cleanedText.trim();
  
  const cleanedLength = cleanedText.length;
  const watermarksDetected = detectedWatermarks.length > 0;
  
  return {
    original: originalText,
    cleaned: cleanedText,
    stats: {
      originalLength,
      cleanedLength,
      charactersRemoved: totalRemoved,
      watermarksDetected,
      detectedWatermarks,
      processingTime: new Date().toISOString()
    }
  };
}

/**
 * Main API handler function
 */
export default function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are supported.',
      allowedMethods: ['POST']
    });
  }
  
  try {
    // Validate request body
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
    
    // Validate text parameter
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
    
    // Log processing attempt (for debugging)
    console.log(`Processing text of length: ${text.length}`);
    
    // Process the text
    const result = removeWatermarks(text);
    
    // Log successful processing
    console.log(`Successfully processed text. Removed ${result.stats.charactersRemoved} watermark characters`);
    
    // Return successful response
    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0.1' // Updated version number
    });
    
  } catch (error) {
    // Log error for debugging
    console.error('Error processing request:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while processing text',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Export the function for testing purposes
export { removeWatermarks };
