import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  SentIcon, 
  SparklesIcon,
  UserIcon,
  Message01Icon,
  TradeUpIcon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import { FormattedMessage } from './FormattedMessage';
import { TypewriterMessage } from './TypewriterMessage';

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
  { label: 'Customer insights', prompt: 'What key insights has ace learned across all customer conversations?', icon: BookOpen01Icon },
  { label: 'What changed?', prompt: 'What relationship changes or emerging customer concerns were detected recently?', icon: TradeUpIcon },
  { label: 'Summarize conversations', prompt: 'Summarize recent customer interactions and highlight important themes.', icon: Message01Icon },
  { label: 'Specific customer context', prompt: 'Tell me everything ace has learned about Sarah Chen and Apex Global Logistics.', icon: UserIcon },
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I'm **ace**, your customer intelligence agent. I continuously remember and connect what we learn across customer conversations, emails, and meetings. How can I help you reason over customer context today?`,
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

  // Auto-scroll smoothly when messages or streaming updates occur
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingMessageId]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
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
            // Skip parse errors
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
          text: `ace reasoning is currently using offline memory synthesis: "${err.message || 'Network error'}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
      setIsThinking(false);
      setStreamingMessageId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#966035] text-white flex items-center justify-center shadow-xs">
            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">Ask ace</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Customer Intelligence & Business Memory</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
        {messages.map((m) => {
          const isCurrentlyStreaming = streamingMessageId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-4 leading-relaxed ${
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

      {/* Quick Prompts */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-1">
          Suggested Questions
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleSendMessage(action.prompt)}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[#966035]">
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask ace anything about your customers..."
          className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#966035]"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isGenerating}
          className="w-9 h-9 rounded-xl bg-[#966035] hover:bg-[#83532c] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
