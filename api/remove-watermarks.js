
// ChatGPT Watermark Removal API - SMART VERSION
// Fully production-ready serverless function for Vercel deployment

import { detectWatermarks } from './utils/watermarkDetector.js';
import { cleanWatermarks } from './utils/textCleaner.js';

/**
 * Removes ChatGPT watermarks from text while preserving original formatting
 */
function removeWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalText = text;
  const detection = detectWatermarks(text);
  const cleanedText = cleanWatermarks(text);

  console.log(`Processing complete:`, {
    originalLength: detection.originalLength,
    cleanedLength: cleanedText.length,
    charactersRemoved: detection.totalRemoved,
    cleanedText: cleanedText.substring(0, 100) + (cleanedText.length > 100 ? '...' : '')
  });

  return {
    original: originalText,
    cleaned: cleanedText,
    stats: {
      originalLength: detection.originalLength,
      cleanedLength: cleanedText.length,
      charactersRemoved: detection.totalRemoved,
      watermarksDetected: detection.watermarksDetected,
      detectedWatermarks: detection.detectedWatermarks,
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
