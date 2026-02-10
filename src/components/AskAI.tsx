import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types/chat';
// import { API_URL } from 'astro:env/client';

const STORAGE_KEY = 'ask-ai-messages';
const MAX_MESSAGES = 50;
const API_URL = 'https://personal-site-be.ghozifidaul.workers.dev/chat'

const WELCOME_MESSAGE: ChatMessage = {
	role: 'assistant',
	content:
		"Hi! I'm here to answer questions about Ghozi's experience, skills, and projects. What would you like to know?",
	timestamp: Date.now(),
};

// Markdown components with neutral styling
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
			<code className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs font-mono">
				{children}
			</code>
		) : (
			<pre className="p-3 bg-neutral-800 dark:bg-neutral-950 rounded-lg overflow-x-auto my-2">
				<code className="text-xs font-mono text-neutral-100">{children}</code>
			</pre>
		);
	},
	a: ({ children, href }: ComponentPropsWithoutRef<'a'>) => (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="underline hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
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
		<blockquote className="border-l-2 border-neutral-400 dark:border-neutral-500 pl-3 my-2 italic">
			{children}
		</blockquote>
	),
	hr: () => <hr className="border-neutral-300 dark:border-neutral-600 my-3" />,
};

export default function AskAI() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Load messages from localStorage on mount
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

	// Save messages to localStorage whenever they change
	useEffect(() => {
		if (messages.length > 0) {
			const trimmed = messages.slice(-MAX_MESSAGES);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
		}
	}, [messages]);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [input]);

	// Focus input when chat opens
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
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();

			const assistantMessage: ChatMessage = {
				role: 'assistant',
				content: data.response,
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (err) {
			setError('Sorry, I am unable to respond at the moment. Please try again later.');
		} finally {
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
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
							onClick={() => setIsOpen(false)}
						/>

						{/* Chat Window */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2, ease: 'easeOut' }}
							className="absolute bottom-16 right-0 w-[380px] max-w-[calc(100vw-3rem)] z-50"
						>
							<div className="border border-neutral-300 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl">
								{/* Header */}
								<div className="flex items-center justify-between px-4 py-3 border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
										<div>
											<h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
												Ask AI
											</h3>
											<p className="text-xs text-neutral-500 dark:text-neutral-400">
												Ask about Ghozi
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1">
										<button
											onClick={clearChat}
											className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800"
											title="Clear conversation"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
										<button
											onClick={() => setIsOpen(false)}
											className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800"
											aria-label="Close chat"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								</div>

								{/* Messages */}
								<div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-white dark:bg-neutral-900">
									{messages.map((message, index) => (
										<motion.div
											key={`${message.timestamp}-${index}`}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.2 }}
											className={`flex ${
												message.role === 'user' ? 'justify-end' : 'justify-start'
											}`}
										>
											<div
												className={`max-w-[90%] ${
													message.role === 'user'
														? 'bg-neutral-900 dark:bg-neutral-700 text-neutral-50 rounded-2xl rounded-br-md'
														: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-md'
												} px-4 py-3`}
											>
												{message.role === 'user' ? (
													<p className="text-sm leading-relaxed whitespace-pre-wrap">
														{message.content}
													</p>
												) : (
													<div className="prose prose-sm dark:prose-invert max-w-none prose-neutral">
														<ReactMarkdown
															remarkPlugins={[remarkGfm]}
															components={markdownComponents}
														>
															{message.content}
														</ReactMarkdown>
													</div>
												)}
												<span
													className={`text-xs mt-2 block ${
														message.role === 'user'
															? 'text-neutral-400'
															: 'text-neutral-500 dark:text-neutral-400'
													}`}
												>
													{formatTime(message.timestamp)}
												</span>
											</div>
										</motion.div>
									))}

									{/* Loading indicator */}
									{isLoading && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="flex justify-start"
										>
											<div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3">
												<div className="flex gap-1">
													<motion.span
														className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500"
														animate={{ y: [0, -6, 0] }}
														transition={{
															repeat: Infinity,
															duration: 0.6,
															delay: 0,
														}}
													/>
													<motion.span
														className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500"
														animate={{ y: [0, -6, 0] }}
														transition={{
															repeat: Infinity,
															duration: 0.6,
															delay: 0.15,
														}}
													/>
													<motion.span
														className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500"
														animate={{ y: [0, -6, 0] }}
														transition={{
															repeat: Infinity,
															duration: 0.6,
															delay: 0.3,
														}}
													/>
												</div>
											</div>
										</motion.div>
									)}

									{/* Error message */}
									{error && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="flex justify-center"
										>
											<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-2 text-sm max-w-[90%]">
												{error}
											</div>
										</motion.div>
									)}

									<div ref={messagesEndRef} />
								</div>

								{/* Input area */}
								<div className="border-t border-neutral-300 dark:border-neutral-700 p-3 bg-neutral-50 dark:bg-neutral-950">
									<div className="flex gap-2">
										<textarea
											ref={textareaRef}
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyDown={handleKeyDown}
											placeholder="Ask about Ghozi..."
											className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none min-h-[40px] max-h-[100px]"
											rows={1}
											disabled={isLoading}
										/>
										<button
											onClick={handleSend}
											disabled={!input.trim() || isLoading}
											className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 transition-colors"
											aria-label="Send message"
										>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M14 5l7 7m0 0l-7 7m7-7H3"
													/>
												</svg>
										</button>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Floating Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors z-50 ${
					isOpen
						? 'bg-neutral-700 dark:bg-neutral-300 text-neutral-50 dark:text-neutral-900'
						: 'bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900'
				}`}
				aria-label={isOpen ? 'Close chat' : 'Open chat'}
			>
				<AnimatePresence mode="wait">
					{isOpen ? (
						<motion.svg
							key="close"
							initial={{ rotate: -90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: 90, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</motion.svg>
					) : (
						<motion.svg
							key="chat"
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.5, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</motion.svg>
					)}
				</AnimatePresence>

				{/* Notification dot */}
				{!isOpen && messages.length > 1 && (
					<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
				)}
			</motion.button>
		</div>
	);
}
