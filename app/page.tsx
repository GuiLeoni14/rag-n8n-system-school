'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect } from 'react'
import { Send, Trash2, GraduationCap, Compass, HelpCircle, FileText, Calendar, MessageSquare, AlertCircle } from 'lucide-react'

// Elegant SVG representation of the IFSULDEMINAS logo/badge
const IFLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Red dot (top left) */}
    <rect x="15" y="15" width="20" height="20" rx="4" fill="#d22630" />
    {/* Green boxes forming the IF mark */}
    <rect x="40" y="15" width="20" height="20" rx="4" fill="#008c3a" />
    <rect x="65" y="15" width="20" height="20" rx="4" fill="#008c3a" />
    
    <rect x="40" y="40" width="20" height="20" rx="4" fill="#008c3a" />
    <rect x="15" y="40" width="20" height="20" rx="4" fill="#008c3a" />
    
    <rect x="15" y="65" width="20" height="20" rx="4" fill="#008c3a" />
    <rect x="40" y="65" width="20" height="20" rx="4" fill="#008c3a" />
    <rect x="65" y="65" width="20" height="20" rx="4" fill="#008c3a" />
  </svg>
)

export default function Home() {
  const { messages, input, setInput, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou o **Assistente IFSULDEMINAS - Campus Machado**. 🎓\n\nEstou aqui para ajudar você com informações oficiais do nosso campus. Posso esclarecer dúvidas sobre:\n\n*   📅 **Horários de aulas** e calendários;\n*   📄 **Documentos acadêmicos** (solicitações, histórico);\n*   📚 **Cursos oferecidos** (técnicos, graduação, pós-graduação);\n*   ⚖️ **Regulamentos, portarias** e normas da instituição;\n*   🏛️ **Informações institucionais** gerais do campus Machado.\n\nComo posso ajudar você hoje?'
      }
    ]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou o **Assistente IFSULDEMINAS - Campus Machado**. 🎓\n\nEstou aqui para ajudar você com informações oficiais do nosso campus. Posso esclarecer dúvidas sobre:\n\n*   📅 **Horários de aulas** e calendários;\n*   📄 **Documentos acadêmicos** (solicitações, histórico);\n*   📚 **Cursos oferecidos** (técnicos, graduação, pós-graduação);\n*   ⚖️ **Regulamentos, portarias** e normas da instituição;\n*   🏛️ **Informações institucionais** gerais do campus Machado.\n\nComo posso ajudar você hoje?'
      }
    ])
  }

  // Predefined quick-start suggestions for academic life
  const suggestions = [
    { text: 'Quais cursos superiores são oferecidos?', icon: GraduationCap },
    { text: 'Como solicitar o histórico escolar?', icon: FileText },
    { text: 'Qual o horário das aulas do campus?', icon: Calendar },
    { text: 'Onde encontro o regulamento acadêmico?', icon: Compass },
  ]

  const handleSuggestionClick = (text: string) => {
    setInput(text)
  }

  // Parses basic inline markdown structure (bold and lists)
  const formatMessageContent = (content: string) => {
    const paragraphs = content.split('\n\n')
    return paragraphs.map((para, i) => {
      // Check if this paragraph contains bullet items
      if (para.trim().startsWith('* ') || para.trim().startsWith('- ')) {
        const items = para.split('\n').map((line, lineIdx) => {
          const itemText = line.trim().replace(/^[\*\-]\s+/, '')
          if (!itemText) return null
          return (
            <li 
              key={lineIdx} 
              className="ml-4 list-disc mb-1 text-sm md:text-base leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(itemText) }} 
            />
          )
        }).filter(Boolean)
        
        return <ul key={i} className="my-2 space-y-1">{items}</ul>
      }
      
      return (
        <p 
          key={i} 
          className="mb-2 text-sm md:text-base leading-relaxed whitespace-pre-line" 
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(para) }} 
        />
      )
    })
  }

  const parseInlineMarkdown = (text: string): string => {
    // Bold: **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground dark:text-white">$1</strong>')
    // Inline code: `code`
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    return html
  }

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
      {/* Institutional Top Header */}
      <header className="sticky top-0 z-50 glass-header flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-border">
            <IFLogo className="w-8 h-8" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Assistente IFSULDEMINAS
            </h1>
            <p className="text-xs text-muted leading-none">
              Campus Machado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Limpar histórico do chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages Panel */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant'
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[85%] md:max-w-[80%] animate-slideup ${
                  isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  isAssistant 
                    ? 'bg-slate-100 border border-border text-primary dark:bg-slate-800 dark:border-slate-700' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {isAssistant ? (
                    <IFLogo className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-semibold uppercase">VC</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow-xs border ${
                  isAssistant
                    ? 'bg-card text-card-foreground border-border'
                    : 'bg-primary text-primary-foreground border-transparent rounded-tr-none'
                }`}>
                  {formatMessageContent(message.content)}
                </div>
              </div>
            )
          })}

          {/* Chat status loader when model is generating */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto animate-pulse-slow">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 border border-border text-primary dark:bg-slate-800 dark:border-slate-700">
                <IFLogo className="w-5 h-5" />
              </div>
              <div className="bg-card text-card-foreground border border-border rounded-2xl px-4 py-3 shadow-xs">
                <div className="flex space-x-1 items-center h-5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Visual errors notification */}
          {error && (
            <div className="flex gap-3 items-center justify-center p-4 rounded-xl border border-red-200/50 bg-red-500/10 text-red-600 dark:text-red-400 text-sm max-w-lg mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Ocorreu um erro ao conectar com o assistente acadêmico. Verifique sua conexão ou chaves de API.</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggestion Chips & User Prompt Form */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Show quick suggestion chips if only the welcome message is present */}
          {messages.length === 1 && !input && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-primary" />
                Perguntas Frequentes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, idx) => {
                  const Icon = sug.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug.text)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs md:text-sm text-left font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary border border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5 rounded-xl transition-all shadow-xs"
                    >
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{sug.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form input field */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua dúvida acadêmica aqui..."
              disabled={isLoading}
              className="flex-1 bg-background text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-muted disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-muted select-none">
            Este assistente oficial do IFSULDEMINAS Machado responde dúvidas com base em documentos do portal.mch.ifsuldeminas.edu.br.
          </p>
        </div>
      </footer>
    </div>
  )
}
