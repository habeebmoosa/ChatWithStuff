import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/embedding-001" });

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  try {

    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message,
            },
            {
              type: 'file',
              data: fs.readFileSync('D:/HMSD/projects/projectWeb/Intermediate/chat-with-doc/public/doc.pdf'),
              mimeType: 'application/pdf',
            },
          ],
        },
      ],
    });

    return NextResponse.json({ response: result.text })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json({ error: 'Error processing chat' }, { status: 500 })
  }


}