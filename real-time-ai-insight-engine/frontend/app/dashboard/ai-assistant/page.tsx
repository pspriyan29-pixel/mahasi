'use client';

/**
 * AI Chat Assistant
 * Interactive AI assistant for data exploration and insights
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Download, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
        charts?: any[];
        insights?: any[];
        suggestions?: string[];
    };
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. I can help you analyze your data, generate insights, and answer questions about your events and metrics. What would you like to know?',
            timestamp: new Date(),
            metadata: {
                suggestions: [
                    'Show me anomalies from the last 24 hours',
                    'What are the top regions by transaction volume?',
                    'Analyze the trend for this week',
                    'Generate a summary report',
                ],
            },
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Call AI assistant API
            const response = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.slice(-5), // Last 5 messages for context
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                metadata: data.metadata,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to get AI response');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    const handleCopy = async (content: string, id: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            setCopiedId(null);
        };
    }, []);

    const handleExport = () => {
        const exportData = messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-conversation-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Conversation exported');
    };

    const handleClear = () => {
        setMessages([messages[0]]); // Keep welcome message
        toast.success('Conversation cleared');
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Assistant</h1>
                    <p className="text-muted-foreground">
                        Ask questions and get intelligent insights about your data
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClear}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {/* Message Header */}
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {message.role === 'assistant' && (
                                                <Sparkles className="h-4 w-4" />
                                            )}
                                            <span className="text-xs font-medium">
                                                {message.role === 'user' ? 'You' : 'AI Assistant'}
                                            </span>
                                            <span className="text-xs opacity-70">
                                                {message.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleCopy(message.content, message.id)}
                                        >
                                            {copiedId === message.id ? (
                                                <Check className="h-3 w-3" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Message Content */}
                                    <div className="whitespace-pre-wrap">{message.content}</div>

                                    {/* Suggestions */}
                                    {message.metadata?.suggestions && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs font-medium opacity-70">
                                                Suggested questions:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {message.metadata.suggestions.map((suggestion, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Charts/Insights */}
                                    {message.metadata?.charts && (
                                        <div className="mt-4">
                                            {/* Render charts here */}
                                            <p className="text-xs opacity-70">
                                                📊 {message.metadata.charts.length} chart(s) attached
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 animate-pulse" />
                                        <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask a question about your data..."
                            className="min-h-[60px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="lg"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
                <h3 className="mb-3 text-sm font-medium">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput('Show me the latest anomalies')}
                    >
                        Latest Anomalies
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput('Generate a weekly summary report')}
                    >
                        Weekly Summary
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput('What are the top performing regions?')}
                    >
                        Top Regions
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput('Analyze transaction trends')}
                    >
                        Analyze Trends
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput('Show me high-severity alerts')}
                    >
                        High Severity Alerts
                    </Button>
                </div>
            </Card>
        </div>
    );
}
