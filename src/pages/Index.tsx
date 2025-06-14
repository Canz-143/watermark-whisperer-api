
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Code, Globe, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "14 Watermark Types",
      description: "Detects and removes all known ChatGPT watermark characters including zero-width spaces, em dashes, and more."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Serverless API powered by Vercel for instant processing with minimal latency."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Production Ready",
      description: "Complete error handling, CORS support, and comprehensive response formatting."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "RESTful API",
      description: "Clean REST endpoint that can be integrated into any application or workflow."
    }
  ];

  const watermarkTypes = [
    "Zero-Width Space (U+200B)",
    "Narrow No-Break Space (U+202F)", 
    "Em Space (U+2003)",
    "Non-Breaking Space (U+00A0)",
    "Word Joiner (U+2060)",
    "Zero-Width Non-Joiner (U+200C)",
    "Zero-Width Joiner (U+200D)",
    "Zero-Width No-Break Space (U+FEFF)",
    "Line Separator (U+2028)",
    "Paragraph Separator (U+2029)",
    "Mongolian Vowel Separator (U+180E)",
    "Arabic Letter Mark (U+061C)",
    "Middle Dot (U+00B7)",
    "Em Dash (U+2014)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-8 transition-colors duration-300">
              <Zap className="h-4 w-4 mr-2" />
              Production-Ready Watermark Removal API
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-300">
              ChatGPT Watermark
              <span className="text-blue-600 dark:text-blue-400"> Removal API</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
              Remove hidden watermark characters from AI-generated text with our powerful REST API. 
              Detect and clean 14 different types of invisible Unicode watermarks instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/watermark-remover')}
                className="text-lg px-8 py-3"
              >
                <FileText className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('api-docs')?.scrollIntoView()}
                className="text-lg px-8 py-3"
              >
                <Code className="h-5 w-5 mr-2" />
                API Docs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Powerful Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Built for developers and businesses who need reliable watermark detection and removal
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Watermarks */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Supported Watermark Types
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Our API detects and removes all known ChatGPT watermark characters
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {watermarkTypes.map((type, index) => (
              <div key={index} className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300 transition-colors duration-300">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div id="api-docs" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              API Documentation
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Simple REST API that integrates seamlessly with your applications
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100 transition-colors duration-300">Request</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">POST /api/remove-watermarks</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto text-gray-800 dark:text-gray-200 transition-colors duration-300">
{`curl -X POST /api/remove-watermarks \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your text with watermarks"
  }'`}
                </pre>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100 transition-colors duration-300">Response</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Detailed processing results</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto text-gray-800 dark:text-gray-200 transition-colors duration-300">
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
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/watermark-remover')}
              className="text-lg px-8 py-3"
            >
              <FileText className="h-5 w-5 mr-2" />
              Try Live Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-400 mr-3" />
            <span className="text-2xl font-bold">Watermark Remover API</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500 mb-6 transition-colors duration-300">
            Production-ready API for removing ChatGPT watermarks from text
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="bg-gray-700 dark:bg-gray-600 text-gray-300 dark:text-gray-200 transition-colors duration-300">Vercel Ready</Badge>
            <Badge variant="secondary" className="bg-gray-700 dark:bg-gray-600 text-gray-300 dark:text-gray-200 transition-colors duration-300">CORS Enabled</Badge>
            <Badge variant="secondary" className="bg-gray-700 dark:bg-gray-600 text-gray-300 dark:text-gray-200 transition-colors duration-300">14 Watermark Types</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
