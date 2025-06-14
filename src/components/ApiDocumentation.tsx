
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Code, Key, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const ApiDocumentation = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const endpoint = 'POST https://watermark-whisperer-api.vercel.app/api/remove-watermarks';
  const requestBody = `{
  "text": "Your text with watermarks here"
}`;
  const responseBody = `{
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
}`;

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                <Code className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
              </div>
              API Documentation
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors duration-300">
                REST API
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Integrate watermark removal into your applications
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6 animate-fade-in">
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors duration-300">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200 transition-colors duration-300">14 Watermark Types</div>
                <div className="text-xs text-blue-600 dark:text-blue-300 transition-colors duration-300">Comprehensive detection</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800 transition-colors duration-300">
              <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200 transition-colors duration-300">No API Key</div>
                <div className="text-xs text-green-600 dark:text-green-300 transition-colors duration-300">Free to use</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800 transition-colors duration-300">
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="font-medium text-purple-800 dark:text-purple-200 transition-colors duration-300">JSON Response</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 transition-colors duration-300">Structured data</div>
              </div>
            </div>
          </div>

          {/* Endpoint */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
              Endpoint
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 transition-colors duration-300">
                POST
              </Badge>
            </h4>
            <div className="relative group">
              <code className="block p-4 bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 rounded-lg text-sm font-mono overflow-x-auto transition-colors duration-300">
                {endpoint}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(endpoint, 'endpoint')}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                {copiedSection === 'endpoint' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Request Body */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Request Body</h4>
            <div className="relative group">
              <pre className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm overflow-x-auto text-gray-800 dark:text-gray-200 transition-colors duration-300">
                <code>{requestBody}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(requestBody, 'request')}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedSection === 'request' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Response */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Response</h4>
            <div className="relative group">
              <pre className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm overflow-x-auto text-gray-800 dark:text-gray-200 transition-colors duration-300">
                <code>{responseBody}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(responseBody, 'response')}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedSection === 'response' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ApiDocumentation;
