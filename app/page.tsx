"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load API key from localStorage on component mount
    const storedApiKey = localStorage.getItem('anthropicApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('anthropicApiKey', apiKey.trim());
      alert('API Key saved successfully');
    }
  };

  const navigateToChatPage = (type: string) => {
    router.push(`/${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="absolute top-4 right-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                type="password" 
                placeholder="Enter your Anthropic API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleApiKeySubmit} className="w-full">
                Save API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-2xl mx-auto mt-20 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Chat With Stuff</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigateToChatPage('document')}
          >
            <CardHeader>
              <CardTitle>Chat with PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Upload and interact with your PDF documents</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigateToChatPage('webpage')}
          >
            <CardHeader>
              <CardTitle>Chat with Webpage</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analyze and chat about web page content</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigateToChatPage('excel')}
          >
            <CardHeader>
              <CardTitle>Chat with Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Upload and interact with your Excel spreadsheet</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigateToChatPage('image')}
          >
            <CardHeader>
              <CardTitle>Chat with Image</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get information and chat about Image</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}