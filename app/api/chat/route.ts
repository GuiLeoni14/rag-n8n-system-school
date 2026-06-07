import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1]
  const userQuery = lastMessage.content

  let embedding: number[] = []

  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const embeddingResponse = await embeddingModel.embedContent(userQuery)

    if (embeddingResponse?.embedding?.values) {
      embedding = embeddingResponse.embedding.values
    } else {
      throw new Error('Falha ao gerar o embedding da query.')
    }
  } catch (err) {
    console.error('Gemini Embedding Error:', err)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar embeddings com Gemini.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: 5,
    filter: {}
  })

  console.log('--- DEBUG RAG ---')
  console.log('Query:', userQuery)
  console.log('Documents returned from Supabase RPC:', documents?.length)
  if (matchError) console.error('Match Error:', matchError)

  let contextString = ""
  if (documents && documents.length > 0) {
    contextString = documents.map((doc: any, i: number) => {
      const sourceStr = doc.metadata?.source || doc.metadata?.title || doc.metadata?.url || 'Documento Oficial'
      return `--- Documento ${i + 1} [Fonte: ${sourceStr}] ---\nConteúdo: ${doc.content || doc.document_content || ''}\n`
    }).join('\n')
  }

  console.log('Context string size:', contextString.length)
  console.log('-----------------')

  const systemPrompt = `Você é o "Assistente IFSULDEMINAS - Campus Machado", um assistente acadêmico virtual oficial do IFSULDEMINAS - Campus Machado. Seu papel é responder dúvidas de alunos e da comunidade acadêmica sobre horários, documentos acadêmicos, cursos, regulamentos e informações institucionais.

Você deve seguir rigorosamente as seguintes diretrizes:
1. Responda APENAS com base nos documentos recuperados do banco de dados fornecidos abaixo no contexto.
2. Se o contexto não contiver informações suficientes para responder à pergunta, diga de forma educada que não possui essa informação específica no momento e oriente o aluno a acessar o portal oficial: portal.mch.ifsuldeminas.edu.br ou a se dirigir pessoalmente à secretaria do campus.
3. Utilize uma linguagem formal, clara e acolhedora.
4. NUNCA invente informações, fatos, links ou dados que não estejam presentes no contexto fornecido.
5. Se o usuário estiver apenas saudando (ex: "Oi", "Bom dia"), responda de forma amigável e acolhedora, apresentando-se e colocando-se à disposição para ajudar com dúvidas acadêmicas, informando brevemente o que você pode responder.

CONTEXTO RECUPERADO DOS DOCUMENTOS ACADÊMICOS:
${contextString ? contextString : "Nenhum contexto acadêmico específico encontrado para a pergunta atual. Use apenas a orientação padrão para que o aluno acesse o portal ou procure a secretaria."}`

  try {
    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash', // atualizado de gemini-2.0-flash-001 devido a erro de cota (429)
      systemInstruction: systemPrompt
    })

    const contents = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))

    const responseStream = await chatModel.generateContentStream({
      contents
    })

    const stream = GoogleGenerativeAIStream(responseStream)
    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error('Gemini Chat Generation Error:', err)
    return new Response(
      JSON.stringify({ error: 'Erro ao gerar resposta com Gemini.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}