
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ApiDocumentation = () => {
  return (
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
  );
};

export default ApiDocumentation;
