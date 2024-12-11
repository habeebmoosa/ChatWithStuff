import { NextRequest, NextResponse } from 'next/server'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "@langchain/openai"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const loader = file.name.endsWith('.pdf') ? new PDFLoader(buffer) : new DocxLoader(buffer)
    const docs = await loader.load()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const splits = await textSplitter.splitDocuments(docs)

    const vectorstore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings()
    )

    // Store the vectorstore in a global variable for later use
    global.vectorStore = vectorstore

    return NextResponse.json({ message: 'Document processed successfully' })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json({ error: 'Error processing document' }, { status: 500 })
  }
}

