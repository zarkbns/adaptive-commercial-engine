import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SentIcon, 
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { FormattedMessage } from './FormattedMessage';
import { TypewriterMessage } from './TypewriterMessage';

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

const CUSTOMER_INTELLIGENCE_PROMPTS = [
  'What are the most common customer concerns across recent conversations?',
  'Summarize what Sarah Chen and Apex Global Logistics requested.',
  'What emerging themes are appearing in customer conversations this week?',
  'Which customer requirements should I prepare for in upcoming meetings?',
];

export const AIChatView: React.FC<AIChatViewProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I'm **ace**, your customer intelligence agent. I connect what your business learns across customer interactions and notes. What customer context would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages or streaming updates occur
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingMessageId]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setIsGenerating(true);
    setIsThinking(true);
    setStreamingMessageId(null);

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
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'start') {
              setIsThinking(false);
              botMsgId = 'bot_' + Date.now();
              setStreamingMessageId(botMsgId);
              setMessages((prev) => [
                ...prev,
                {
                  id: botMsgId!,
                  sender: 'assistant',
                  text: '',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            } else if (data.type === 'chunk' && botMsgId) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMsgId ? { ...msg, text: msg.text + (data.text || '') } : msg
                )
              );
            } else if (data.type === 'done') {
              setStreamingMessageId(null);
            } else if (data.type === 'error') {
              setIsThinking(false);
              setStreamingMessageId(null);
              setMessages((prev) => [
                ...prev,
                {
                  id: 'err_' + Date.now(),
                  sender: 'assistant',
                  text: data.message || 'I encountered an issue synthesizing customer context.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err: any) {
      setIsThinking(false);
      setStreamingMessageId(null);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: `ace reasoning synthesis: ${err.message || 'Unable to connect.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
      setIsThinking(false);
      setStreamingMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-2xl bg-[#966035] text-white flex items-center justify-center shadow-xs">
          <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Ask ace</h1>
          <p className="text-xs text-zinc-500">Reasoning over customer conversations, preferences, and accumulated memory</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        {messages.map((m) => {
          const isCurrentlyStreaming = streamingMessageId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-3xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-br-none shadow-xs'
                    : 'bg-[#f7f4ee] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none border border-[#e6ded3] dark:border-zinc-700/60'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : isCurrentlyStreaming ? (
                  <TypewriterMessage fullText={m.text} isStreaming={true} />
                ) : (
                  <FormattedMessage text={m.text} />
                )}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center space-x-2 text-zinc-400 text-xs p-2">
            <div className="w-2 h-2 rounded-full bg-[#966035] animate-pulse" />
            <span>ace is reviewing customer memory and reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 pt-1">
        {CUSTOMER_INTELLIGENCE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm p-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask ace anything about your customers, preferences, or conversations..."
          className="flex-1 px-4 py-2 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isGenerating}
          className="w-10 h-10 rounded-full bg-[#966035] hover:bg-[#83532c] disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
