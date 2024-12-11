"use client"

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, Upload } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function DocumentChat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Check if it's a PDF
            if (selectedFile.type !== 'application/pdf') {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a PDF file",
                    variant: "destructive"
                })
                return
            }
            setFile(selectedFile)
        }
    }

    const handleInitializeDocument = async () => {
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a PDF file",
                variant: "destructive"
            })
            return
        }

        try {
            setIsLoading(true)
            
            // Create FormData to send file
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL}/document/initialize`, {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                setIsInitialized(true)
                toast({
                    title: "Success",
                    description: "Document initialized successfully",
                })
            } else {
                const errorData = await response.json()
                toast({
                    title: "Initialization Error",
                    description: errorData.detail || "Failed to initialize document",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Network Error",
                description: "Unable to connect to the server",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return
        if (!isInitialized) {
            toast({
                title: "Not Initialized",
                description: "Please initialize a document first",
                variant: "destructive"
            })
            return
        }

        const userMessage: Message = { role: 'user', content: input }
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL}/document/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: input }),
            })

            if (response.ok) {
                const data = await response.json()
                const assistantMessage: Message = { role: 'assistant', content: data.response }
                setMessages((prevMessages) => [...prevMessages, assistantMessage])
            } else {
                const errorData = await response.json()
                toast({
                    title: "Chat Error",
                    description: errorData.detail || "Failed to get response",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Network Error",
                description: "Unable to send message",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Document Chat</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* File Initialization Section */}
                    <div className="mb-4 flex space-x-2">
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isInitialized}
                            className="flex-grow"
                        />
                        <Button
                            onClick={handleInitializeDocument}
                            disabled={isInitialized || isLoading || !file}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Initialize
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Chat Messages Section */}
                    <div className="overflow-y-auto mb-4 p-2 border rounded min-h-96">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <span
                                    className={`inline-block p-2 rounded max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {message.content}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Message Input Section */}
                    <div className="flex space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            disabled={!isInitialized}
                            className="flex-grow"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || !isInitialized || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}