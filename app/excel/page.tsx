"use client"

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, Upload } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function ExcelChat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [excelData, setExcelData] = useState<any[][]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Check if it's an Excel file
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ]
            if (!validTypes.includes(selectedFile.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload an Excel file (.xlsx or .xls)",
                    variant: "destructive"
                })
                return
            }
            setFile(selectedFile)

            // Read Excel file
            const reader = new FileReader()
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target?.result, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                setExcelData(data as any[][])
            }
            reader.readAsBinaryString(selectedFile)
        }
    }

    const handleInitializeDocument = async () => {
        if (!file) {
            toast({
                title: "Error",
                description: "Please select an Excel file",
                variant: "destructive"
            })
            return
        }

        try {
            setIsLoading(true)
            
            // Create FormData to send file
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL}/excel/initialize`, {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                setIsInitialized(true)
                toast({
                    title: "Success",
                    description: "Excel document initialized successfully",
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
                description: "Please initialize an Excel document first",
                variant: "destructive"
            })
            return
        }

        const userMessage: Message = { role: 'user', content: input }
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL}/excel/chat`, {
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
        <div className="grid grid-cols-2 w-screen gap-4 mx-auto p-4">
            {/* Excel File Display Section */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Excel File Contents</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* File Initialization Section */}
                    <div className="mb-4 flex space-x-2">
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
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

                    {/* Excel Data Display Section */}
                    <div className="overflow-x-auto max-h-[500px]">
                        {excelData.length > 0 && (
                            <table className="w-full border-collapse border">
                                <thead>
                                    <tr>
                                        {excelData[0].map((header, index) => (
                                            <th 
                                                key={index} 
                                                className="border p-2 bg-gray-100 text-left"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-gray-50">
                                            {row.map((cell, cellIndex) => (
                                                <td 
                                                    key={cellIndex} 
                                                    className="border p-2"
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {excelData.length === 0 && (
                            <div className="text-center text-gray-500 p-4">
                                No Excel file uploaded
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Interface Section */}
            <Card className="max-w-96">
                <CardHeader>
                    <CardTitle>Excel Document Chat</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto">
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
                            placeholder="Ask a question about the Excel file..."
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