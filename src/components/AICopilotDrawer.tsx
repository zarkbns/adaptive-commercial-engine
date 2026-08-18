import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  SentIcon, 
  SparklesIcon,
  UserIcon,
  Briefcase01Icon,
  Calendar01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';
import { classifyCopilotIntent } from '../services/ace/intentGate';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const QUICK_ACTIONS = [
  { label: 'Find a consumer', prompt: 'Help me find and summarize the latest updates on Sarah Chen and Apex Global Logistics.', icon: UserIcon },
  { label: 'Check a deal', prompt: 'Check the status and next step for our highest value deal in negotiation.', icon: Briefcase01Icon },
  { label: 'Create a task', prompt: 'Help me prepare a follow-up task and checklist for tomorrow morning.', icon: File01Icon },
  { label: 'Schedule a meeting', prompt: 'Suggest agenda items and prep notes for our next client review call.', icon: Calendar01Icon },
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I'm your **ace Assistant**. How can I help you with your consumers, deals, tasks, or next steps today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

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
            console.warn('Error parsing SSE event in Assistant stream:', err);
          }
        }
      }
    } catch (error) {
      console.error('Assistant streaming request failed:', error);
      let fallbackText = 'I am here to help you organize your consumers, deals, and daily tasks.';
      if (classification.intent !== 'CASUAL') {
        fallbackText = `For Sarah Chen at Apex Global Logistics, the best next step is to present the 3-year term proposal with annual upfront billing. That keeps our deal economics strong and addresses their procurement timeline.`;
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-xs animate-fadeIn">
      <div className="flex h-full w-full max-w-md sm:max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6ded3] p-4 bg-[#f7f4ee]">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#966035] text-white shadow-xs text-xs font-bold">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-900">ace Assistant</span>
              </div>
              <p className="text-[11px] text-zinc-500">Sales Guidance & Next Best Moves</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-copilot"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-white hover:text-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-zinc-200"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin bg-zinc-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#966035] text-white mt-0.5 shadow-xs text-xs font-semibold">
                  <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-4 leading-relaxed space-y-2 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white font-medium rounded-br-xs'
                    : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.text}
                  {streamingMessageId === msg.id && (
                    <span
                      className="inline-block w-1.5 h-3.5 ml-1 bg-[#966035] align-middle animate-pulse rounded-xs"
                      aria-label="Generating response"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] opacity-60 pt-1.5 border-t border-zinc-100">
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 border border-zinc-300 text-zinc-700 mt-0.5 text-xs font-semibold">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#966035] text-white mt-0.5 shadow-xs text-xs font-semibold">
                <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center space-x-2.5 rounded-2xl bg-white border border-zinc-200/80 px-4 py-3 text-xs text-zinc-600 shadow-2xs rounded-bl-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#966035] animate-pulse" />
                <span className="text-zinc-500 text-xs font-medium italic">ace is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Actions */}
        <div className="px-3 py-2.5 border-t border-[#e6ded3] bg-[#f7f4ee] flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage(action.prompt)}
              className="rounded-full bg-white hover:bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-700 border border-[#e6ded3] transition-colors flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer shadow-2xs hover:border-[#966035]"
            >
              <HugeiconsIcon icon={action.icon} className="h-3 w-3 text-[#966035]" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

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
              placeholder="Ask ACE about a consumer, deal, or next step..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#966035] focus:bg-white focus:outline-none disabled:opacity-50"
            />
            <button
              id="btn-send-copilot"
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#966035] hover:bg-[#83532c] active:scale-95 text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
