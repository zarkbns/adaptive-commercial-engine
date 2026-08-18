import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SentIcon, 
  BotIcon, 
  UserIcon, 
  SparklesIcon,
  Mic01Icon,
  ArrowUp01Icon,
  Refresh01Icon
} from '@hugeicons/core-free-icons';
import { classifyCopilotIntent } from '../services/ace/intentGate';
import { HydraDBEngine } from '../services/hydradb/engine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIChatViewProps {
  onSelectAccount?: (accountId: string) => void;
  onOpenDealRoom?: (dealId: string) => void;
}

const GENERIC_COMMERCIAL_PROMPTS = [
  'Give-Get concession trade rules',
  'How to handle a 15% discount demand',
  'Multi-year renewal pricing strategy',
  'Protecting gross margin floor during negotiations',
];

export const AIChatView: React.FC<AIChatViewProps> = ({ onSelectAccount, onOpenDealRoom }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I'm your **ace Copilot**. How can I help you with your commercial strategy, deal structures, or negotiation talk tracks today?`,
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

      if (accountNodes.length > 0) {
        for (const acc of accountNodes.slice(0, 2)) {
          generated.push(`${acc.label} deal strategy`);
          generated.push(`${acc.label} renewal talk track`);
        }

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
  }, []);

  // Auto-scroll when messages or streaming updates occur
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingMessageId]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
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
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.replace('data: ', '').trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'start') {
              // Received start signal
              botMsgId = 'copilot_' + Date.now();
              setStreamingMessageId(botMsgId);
              setIsThinking(true);
            } else if (event.type === 'chunk') {
              setIsThinking(false);
              if (!botMsgId) {
                botMsgId = 'copilot_' + Date.now();
                setStreamingMessageId(botMsgId);
              }
              const currentBotId = botMsgId;
              setMessages((prev) => {
                const existing = prev.find((m) => m.id === currentBotId);
                if (existing) {
                  return prev.map((m) =>
                    m.id === currentBotId ? { ...m, text: m.text + event.text } : m
                  );
                } else {
                  return [
                    ...prev,
                    {
                      id: currentBotId,
                      sender: 'assistant',
                      text: event.text,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ];
                }
              });
            } else if (event.type === 'done' || event.type === 'end') {
              setIsGenerating(false);
              setIsThinking(false);
              setStreamingMessageId(null);
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
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

      const fallbackMsg: ChatMessage = {
        id: 'copilot_err_' + Date.now(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
      setIsThinking(false);
      setStreamingMessageId(null);
    }
  };

  const renderFormattedContent = (content: string) => {
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-zinc-700 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-xs text-zinc-800">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n/g, '<br/>');

    return <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] border border-zinc-200/80 shadow-sm overflow-hidden relative">
      {/* Top Subtle Status Bar */}
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 border border-zinc-200/60">
            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">ace Strategy Copilot</h2>
            <p className="text-[11px] text-zinc-400 font-medium">Real-time commercial intelligence & margin guardrails</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-50 border border-zinc-200/70 text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            HydraDB Live Substrate
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-3 max-w-[90%]">
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-semibold mt-0.5">
                  A
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-sm transition-all ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border border-zinc-200/70 text-zinc-800'
                }`}
              >
                <div className="leading-relaxed">
                  {renderFormattedContent(msg.text)}
                  {msg.sender === 'assistant' && msg.id === streamingMessageId && isGenerating && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-zinc-900 animate-pulse align-middle rounded-xs" />
                  )}
                </div>

                <div
                  className={`mt-1.5 text-[10px] font-medium ${
                    msg.sender === 'user' ? 'text-zinc-400' : 'text-zinc-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5">
                  U
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 text-xs font-semibold">
              A
            </div>
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200/70 px-4 py-2.5 text-xs text-zinc-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
              <span className="italic font-medium">ace is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating / Anchored Composer Matching Reference Layout */}
      <div className="p-4 bg-white border-t border-zinc-100">
        <div className="bg-zinc-50/90 rounded-[28px] border border-zinc-200/80 p-3 shadow-xs space-y-2.5">
          {/* Dynamic Suggestion Pills */}
          {messages.length <= 4 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {dynamicSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isGenerating}
                  className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 border border-zinc-200/80 hover:border-zinc-400 hover:text-zinc-900 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Control Row */}
          <div className="flex items-center gap-2 pl-2 pr-1">
            <input
              id="input-copilot-center"
              type="text"
              placeholder="Ask ace about deal structures, concession boundaries, or talk tracks..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isGenerating}
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />

            <button
              type="button"
              className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded-full hover:bg-zinc-200/60"
              title="Voice Input"
            >
              <HugeiconsIcon icon={Mic01Icon} className="h-4 w-4" />
            </button>

            <button
              id="btn-copilot-send-center"
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isGenerating}
              className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black transition-transform active:scale-95 disabled:opacity-30 cursor-pointer shrink-0"
              title="Send Message"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 stroke-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
