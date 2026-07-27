import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TrashIcon, XIcon, PaperPlaneRightIcon, CaretDownIcon, ChatCircleIcon } from '@phosphor-icons/react';
import type { ChatMessage } from '../types/chat';

const STORAGE_KEY = 'ask-ai-messages';
const MAX_MESSAGES = 50;
const API_URL = 'https://personal-site-be.ghozifidaul.workers.dev/chat';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm here to answer questions about Ghozi's experience, skills, and projects. What would you like to know?",
  timestamp: Date.now(),
};

const markdownComponents = {
  p: ({ children }: ComponentPropsWithoutRef<'p'>) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  h1: ({ children }: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="text-lg font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-base font-bold mb-2">{children}</h2>
  ),
  h3: ({ children }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-sm font-bold mb-1">{children}</h3>
  ),
  ul: ({ children }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: ComponentPropsWithoutRef<'li'>) => (
    <li className="text-sm">{children}</li>
  ),
  code: ({ children, className }: ComponentPropsWithoutRef<'code'>) => {
    const isInline = !className;
    return isInline ? (
      <code className="px-1.5 py-0.5 bg-neutral-800 text-xs font-mono">
        {children}
      </code>
    ) : (
      <pre className="p-3 bg-neutral-950 border border-neutral-800 overflow-x-auto my-2">
        <code className="text-xs font-mono text-neutral-100">{children}</code>
      </pre>
    );
  },
  a: ({ children, href }: ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-accent transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: ComponentPropsWithoutRef<'em'>) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-2 border-accent pl-3 my-2 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-neutral-700 my-3" />,
};

export default function AskAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentBufferRef = useRef('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch {
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const trimmed = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role: role,
            content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let hasReceivedContent = false;
      contentBufferRef.current = '';

      const startTypingAnimation = () => {
        if (isTypingRef.current) return;
        isTypingRef.current = true;

        const typeNextChunk = () => {
          if (contentBufferRef.current.length === 0) {
            isTypingRef.current = false;
            return;
          }

          const chunkSize = Math.min(
            Math.floor(Math.random() * 6) + 5,
            contentBufferRef.current.length
          );
          const chunk = contentBufferRef.current.slice(0, chunkSize);
          contentBufferRef.current = contentBufferRef.current.slice(chunkSize);

          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = assistantContent;
            }
            return updated;
          });

          if (contentBufferRef.current.length > 0) {
            typingIntervalRef.current = setTimeout(typeNextChunk, 50);
          } else {
            isTypingRef.current = false;
          }
        };

        typeNextChunk();
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;

            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);

            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                reader.cancel();
                break;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  contentBufferRef.current += `\n\nError: ${parsed.error.message}`;
                  if (!isTypingRef.current) {
                    startTypingAnimation();
                  }
                  reader.cancel();
                  break;
                }

                if (parsed.content) {
                  if (!hasReceivedContent) {
                    hasReceivedContent = true;
                    setIsLoading(false);
                    const assistantMessage: ChatMessage = {
                      role: 'assistant',
                      content: '',
                      timestamp: Date.now(),
                      isStreaming: true,
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                  }
                  contentBufferRef.current += parsed.content;
                  if (!isTypingRef.current) {
                    startTypingAnimation();
                  }
                }
              } catch {
              }
            }
          }
        }
      } finally {
        reader.cancel();
        if (typingIntervalRef.current) {
          clearTimeout(typingIntervalRef.current);
        }
        const finishTyping = () => {
          if (contentBufferRef.current.length > 0) {
            assistantContent += contentBufferRef.current;
            contentBufferRef.current = '';
            setMessages((prev) => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage?.role === 'assistant') {
                lastMessage.content = assistantContent;
              }
              return updated;
            });
          }
          isTypingRef.current = false;
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage?.role === 'assistant') {
              delete (lastMessage as ChatMessage & { isStreaming?: boolean }).isStreaming;
            }
            return updated;
          });
          setIsLoading(false);
        };
        finishTyping();
      }
    } catch (err) {
      setError('Sorry, I am unable to respond at the moment. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-16 right-0 w-[380px] max-w-[calc(100vw-3rem)] z-50"
            >
              <div className="border border-neutral-700 bg-neutral-900 overflow-hidden shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent" />
                    <div>
                      <h3 className="font-medium text-neutral-50 text-sm">
                        Ask AI
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Ask about Ghozi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={clearChat}
                      className="p-2 text-neutral-500 hover:text-neutral-50 transition-colors hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                      title="Clear conversation"
                    >
                      <TrashIcon size={16} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-neutral-500 hover:text-neutral-50 transition-colors hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                      aria-label="Close chat"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-neutral-900">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message.timestamp}-${index}`}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] ${
                          message.role === 'user'
                            ? 'bg-accent text-neutral-50'
                            : 'bg-neutral-800 text-neutral-50'
                        } px-4 py-3`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none prose-neutral">
                            {(message as ChatMessage & { isStreaming?: boolean }).isStreaming ? (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            ) : (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        )}
                        <span
                          className={`text-xs mt-2 block ${
                            message.role === 'user'
                              ? 'text-neutral-200/70'
                              : 'text-neutral-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-neutral-800 px-4 py-3">
                        <div className="flex gap-1">
                          <motion.span
                            className="w-2 h-2 bg-neutral-500"
                            animate={reduce ? undefined : { y: [0, -6, 0] }}
                            transition={reduce ? undefined : { repeat: Infinity, duration: 0.6, delay: 0 }}
                          />
                          <motion.span
                            className="w-2 h-2 bg-neutral-500"
                            animate={reduce ? undefined : { y: [0, -6, 0] }}
                            transition={reduce ? undefined : { repeat: Infinity, duration: 0.6, delay: 0.15 }}
                          />
                          <motion.span
                            className="w-2 h-2 bg-neutral-500"
                            animate={reduce ? undefined : { y: [0, -6, 0] }}
                            transition={reduce ? undefined : { repeat: Infinity, duration: 0.6, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center"
                    >
                      <div className="bg-neutral-900 border border-neutral-700 text-neutral-300 px-4 py-2 text-sm max-w-[90%]">
                        {error}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-neutral-800 p-3 bg-neutral-950">
                  <div className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about Ghozi..."
                      className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none min-h-[40px] max-h-[100px]"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-accent text-neutral-50 hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
                      aria-label="Send message"
                    >
                      <PaperPlaneRightIcon size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        className={`relative w-14 h-14 flex items-center justify-center transition-colors z-50 shadow-2xl shadow-black/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
          isOpen
            ? 'bg-neutral-700 text-neutral-50'
            : 'bg-accent text-neutral-50 hover:bg-accent-light'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={reduce ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CaretDownIcon size={24} weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={reduce ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatCircleIcon size={24} weight="bold" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-50 border-2 border-neutral-950" />
        )}
      </motion.button>
    </div>
  );
}
