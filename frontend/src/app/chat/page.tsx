'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  HelpCircle,
  Code,
  FileCode,
  Compass
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setSending(true);
    setInputText('');

    // Append user query message locally
    const newUserMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: textToSend }],
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // Map frontend model to api history model
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts,
      }));

      const res = await api.post('/chats', {
        message: textToSend,
        history,
      });

      // Append bot model answer reply
      const newBotMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: res.data.reply }],
      };
      
      setMessages([...updatedMessages, newBotMessage]);
    } catch (err) {
      toast.error('Failed to receive response from assistant.');
    } finally {
      setSending(false);
    }
  };

  const starterPrompts = [
    { title: 'Explain a Concept', text: 'Explain the event loop in Node.js with a visual analogy.', icon: Compass },
    { title: 'Generate Code Template', text: 'Write a TypeScript middleware for Express validating JSON schemas with Zod.', icon: Code },
    { title: 'Debug Code Bug', text: 'Explain why my Mongoose schema hook is failing to run validation checks.', icon: FileCode },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[78vh] relative">
        
        {/* MESSAGES THREAD FRAME */}
        <div className="flex-1 overflow-y-auto p-4 border border-border/40 rounded-xl bg-card/10 space-y-4 text-xs font-semibold mb-4">
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-8">
              <div className="space-y-2">
                <MessageSquare className="w-12 h-12 text-primary mx-auto animate-bounce" />
                <h3 className="text-lg font-bold">AI Career & Programming Assistant</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto font-medium">
                  Ask concepts questions, generate code boilerplate templates, or request structural debugging suggestions.
                </p>
              </div>

              {/* Starter suggestions prompts */}
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl w-full text-left">
                {starterPrompts.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
                      className="p-4 rounded-xl border border-border/60 bg-card/25 hover:bg-muted/40 hover:border-border transition-all text-left space-y-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-[11px] leading-tight">{prompt.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed truncate">{prompt.text}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={index} className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold text-[10px] ${isModel ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                      {isModel ? 'AI' : 'ME'}
                    </div>

                    <div className={`p-4.5 rounded-2xl leading-relaxed font-medium ${isModel ? 'bg-muted/40 rounded-tl-none text-foreground/90 prose dark:prose-invert max-w-none text-xs font-semibold' : 'bg-primary text-white rounded-tr-none text-xs'}`}>
                      {isModel ? (
                        <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                      ) : (
                        <span>{msg.parts[0].text}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-[10px]">
                    AI
                  </div>
                  <div className="p-4.5 rounded-2xl rounded-tl-none bg-muted/40 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground font-bold">Formulating answer...</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* INPUT INPUT BAR */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }} 
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask question, e.g. explain SQL join options..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-grow px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-3 bg-primary text-white rounded-lg shadow hover:bg-primary/95 transition-all flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

      </div>
    </DashboardLayout>
  );
}
