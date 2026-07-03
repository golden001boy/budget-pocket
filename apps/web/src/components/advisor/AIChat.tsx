'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Message {
  id:      string;
  role:    string;
  content: string;
}

interface Props {
  initialMessages?: Message[];
  conversationId?:  string;
}

export function AIChat({ initialMessages = [], conversationId }: Props) {
  const [messages, setMessages]   = useState<Message[]>(initialMessages);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [convId, setConvId]       = useState<string | undefined>(conversationId);
  const [error, setError]         = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    const assistantId = `a-${Date.now()}`;
    setMessages((m) => [...m, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/advisor/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ conversationId: convId, message: content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const json = line.slice(6);
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            if (parsed.type === 'conversation_id') {
              setConvId(parsed.id);
            } else if (parsed.type === 'text') {
              fullText += parsed.text;
              setMessages((m) =>
                m.map((msg) => msg.id === assistantId ? { ...msg, content: fullText } : msg),
              );
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      setMessages((m) => m.filter((msg) => msg.id !== assistantId));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-12 w-12 text-blue-400 mb-3" />
              <p className="font-medium">Bonjour ! Je suis votre conseiller financier IA.</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Posez-moi vos questions sur votre budget, vos investissements ou votre planification retraite.
                Je consulte vos données financières réelles pour vous répondre.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  'Quel est mon taux d\'épargne ?',
                  'Comment réduire mes dépenses ?',
                  'Conseille-moi pour la BRVM',
                  'Quand pourrai-je prendre ma retraite ?',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm',
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-blue-100 text-blue-600',
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-secondary text-secondary-foreground rounded-tl-sm',
              )}>
                {msg.content || (loading && msg.role === 'assistant' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {/* Input area */}
      {error && (
        <p className="text-sm text-destructive mb-2">{error}</p>
      )}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question financière… (Entrée pour envoyer)"
          rows={2}
          className="resize-none flex-1"
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="h-full w-12">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
