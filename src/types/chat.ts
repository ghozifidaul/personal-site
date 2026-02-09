export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export interface ChatRequest {
	messages: {
		role: 'user' | 'assistant';
		content: string;
	}[];
}

export interface ChatResponse {
	response: string;
}
