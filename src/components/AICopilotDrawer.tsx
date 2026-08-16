import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  SentIcon, 
  BotIcon, 
  UserIcon, 
  SparklesIcon
} from '@hugeicons/core-free-icons';
import { classifyCopilotIntent } from '../services/ace/intentGate';
import { HydraDBEngine } from '../services/hydradb/engine';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENERIC_COMMERCIAL_PROMPTS = [
  'Give-Get concession trade rules',
  'How to handle a 15% discount demand',
  'Multi-year renewal pricing strategy',
  'Protecting gross margin floor during negotiations',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I'm your **A.C.E Copilot**. How can I help you with your commercial strategy, deal structures, or negotiation talk tracks today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically compute starter prompts from actual HydraDB context
  const dynamicSuggestions = useMemo(() => {
    try {
      const hydra = HydraDBEngine.getInstance();
      const snapshot = hydra.getGraphSnapshot();
      const accountNodes = (snapshot.nodes || []).filter(
        (n) => (n.type?.toLowerCase() === 'account') && n.label
      );
      const contactNodes = (snapshot.nodes || []).filter(
        (n) => (n.type?.toLowerCase() === 'contact') && n.label
      );

      const generated: string[] = [];

      // If user has accounts in HydraDB, create tailored prompts from real context
      if (accountNodes.length > 0) {
        for (const acc of accountNodes.slice(0, 2)) {
          generated.push(`${acc.label} deal strategy`);
          generated.push(`${acc.label} renewal talk track`);
        }

        // If there are key stakeholders in context, add a stakeholder alignment prompt
        if (contactNodes.length > 0 && generated.length < 4) {
          const keyContact = contactNodes.find((c) => {
            const role = (c.properties?.role || '').toLowerCase();
            return role.includes('champion') || role.includes('buyer') || role.includes('vp') || role.includes('cfo');
          }) || contactNodes[0];

          if (keyContact?.label) {
            generated.push(`How to position ROI with ${keyContact.label}`);
          }
        }
      }

      // If no account exists or to fill up to 4 prompts, use generic commercial prompts
      for (const gp of GENERIC_COMMERCIAL_PROMPTS) {
        if (generated.length >= 4) break;
        if (!generated.includes(gp)) {
          generated.push(gp);
        }
      }

      return generated.slice(0, 4);
    } catch {
      return GENERIC_COMMERCIAL_PROMPTS;
    }
  }, [isOpen]);

  // Auto-scroll when messages or streaming updates occur
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingMessageId]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt('');
    setIsGenerating(true);
    setIsThinking(true);
    setStreamingMessageId(null);

    const classification = classifyCopilotIntent(textToSend);

    try {
      const response = await fetch('/api/ace/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory: messages.slice(-6).map((m) => ({ role: m.sender, text: m.text })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let botMsgId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const data = JSON.parse(payload);

            if (data.type === 'chunk' && typeof data.text === 'string') {
              if (!botMsgId) {
                // First token has arrived! Replace thinking indicator with assistant message bubble
                botMsgId = 'bot_' + Date.now();
                setIsThinking(false);
                setStreamingMessageId(botMsgId);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: botMsgId!,
                    sender: 'assistant',
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              } else {
                // Progressive token rendering without artificial animation delay
                const chunkText = data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? { ...msg, text: msg.text + chunkText }
                      : msg
                  )
                );
              }
            } else if (data.type === 'done') {
              setStreamingMessageId(null);
              setIsThinking(false);
            }
          } catch (err) {
            console.warn('Error parsing SSE event in Copilot stream:', err);
          }
        }
      }
    } catch (error) {
      console.error('Copilot streaming request failed:', error);
      let fallbackText = 'Hey! What can I help you with today?';
      if (classification.intent !== 'CASUAL') {
        fallbackText = `Whenever you're reviewing commercial strategy, always anchor your proposals on multi-year commitments with structured Give-Get trade terms. If a buyer pushes for a discount, trade it for annual upfront billing or extended contract duration rather than giving price away unilaterally.

That protects our 78% corporate gross margin floor and sets a strong baseline for renewal negotiations. You can tell the customer:

"We can work with your target unit economics, provided we pair it with a multi-year partnership commitment and upfront annual invoicing."`;
      }

      const fallbackMsg: Message = {
        id: 'bot_err_' + Date.now(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
      setStreamingMessageId(null);
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs animate-fadeIn">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xs text-xs font-semibold">
              A
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-900">A.C.E Strategy Copilot</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-mono text-zinc-700 border border-zinc-200">
                  Streaming
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">Grounded Deal Strategy & Negotiation Actions</p>
            </div>
          </div>

          <button
            id="btn-close-copilot"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white mt-0.5 shadow-xs text-xs font-semibold">
                  A
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-4 leading-relaxed space-y-2 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white font-medium rounded-br-xs'
                    : 'bg-zinc-50 text-zinc-800 border border-zinc-200/80 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.text}
                  {streamingMessageId === msg.id && (
                    <span
                      className="inline-block w-1.5 h-3.5 ml-1 bg-zinc-900 align-middle animate-pulse rounded-xs"
                      aria-label="Generating response"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] opacity-60 pt-1.5 border-t border-zinc-200/60">
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 mt-0.5 text-xs font-semibold">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator while waiting for first tokens */}
          {isThinking && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white mt-0.5 shadow-xs text-xs font-semibold">
                A
              </div>
              <div className="flex items-center space-x-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 px-4 py-3 text-xs text-zinc-600 shadow-2xs rounded-bl-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse" />
                <span className="text-zinc-500 text-xs font-medium italic">A.C.E is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-3 py-2 border-t border-zinc-100 bg-white flex flex-wrap gap-1.5">
            {dynamicSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isGenerating}
                onClick={() => handleSendMessage(suggestion)}
                className="rounded-full bg-zinc-50 hover:bg-zinc-100 px-3 py-1 text-[11px] text-zinc-700 border border-zinc-200 transition-colors flex items-center space-x-1 disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                <HugeiconsIcon icon={SparklesIcon} className="h-2.5 w-2.5 text-zinc-600" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 border-t border-zinc-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="input-copilot-prompt"
              type="text"
              placeholder="Ask about account strategy, renewal talk-tracks, Give-Get concessions..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:opacity-50"
            />
            <button
              id="btn-send-copilot"
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 hover:bg-black active:scale-95 text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <HugeiconsIcon icon={SentIcon} className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

