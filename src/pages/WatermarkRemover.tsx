import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, FileText, Zap } from "lucide-react";
import { toast } from "sonner";

const WatermarkRemover = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveWatermarks = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to process');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://watermark-whisperer-api.vercel.app/api/remove-watermarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        toast.success(`Successfully removed ${data.stats.charactersRemoved} watermark characters!`);
      } else {
        toast.error(data.error || 'Failed to process text');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const addSampleWatermarks = () => {
    const sampleText = "This is a sample text with hidden watermarks.";
    // Add some invisible watermark characters
    const watermarkedText = sampleText.replace(/\s/g, '\u200B \u202F');
    setInputText(watermarkedText);
    toast.info('Added sample text with watermarks');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChatGPT Watermark Remover
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Remove hidden watermark characters from ChatGPT-generated text. 
            Our API detects and removes 14 different types of watermark characters.
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste your text below to remove hidden watermarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleRemoveWatermarks} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isLoading ? 'Processing...' : 'Remove Watermarks'}
              </Button>
              <Button 
                variant="outline" 
                onClick={addSampleWatermarks}
              >
                Add Sample Text
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Watermark removal completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.stats.originalLength}
                  </div>
                  <div className="text-sm text-gray-600">Original Length</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.stats.cleanedLength}
                  </div>
                  <div className="text-sm text-gray-600">Cleaned Length</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {result.stats.charactersRemoved}
                  </div>
                  <div className="text-sm text-gray-600">Removed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.stats.detectedWatermarks.length}
                  </div>
                  <div className="text-sm text-gray-600">Types Found</div>
                </div>
              </div>

              {/* Detected Watermarks */}
              {result.stats.detectedWatermarks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detected Watermarks</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.stats.detectedWatermarks.map((watermark, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {watermark.name} ({watermark.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Cleaned Text */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Cleaned Text</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.cleaned)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm">
                    {result.cleaned}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Use this API programmatically in your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                  POST https://watermark-whisperer-api.vercel.app/api/remove-watermarks
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`{
  "text": "Your text with watermarks here"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "original": "original text",
  "cleaned": "cleaned text",
  "stats": {
    "originalLength": 100,
    "cleanedLength": 95,
    "charactersRemoved": 5,
    "watermarksDetected": true,
    "detectedWatermarks": [...]
  }
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WatermarkRemover;
