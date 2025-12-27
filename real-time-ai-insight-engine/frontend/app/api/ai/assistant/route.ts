/**
 * AI Assistant API Route
 * Backend handler for AI chat assistant
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Build context from conversation history
        const conversationContext = history
            ?.map((msg: Message) => `${msg.role}: ${msg.content}`)
            .join('\n') || '';

        // Create enhanced prompt with context
        const prompt = `You are an AI assistant for a Real-Time AI Insight Engine platform. You help users analyze their event data, detect anomalies, and gain insights.

Context about the platform:
- Users can track real-time events (transactions, user activities, etc.)
- The system detects anomalies using statistical analysis and AI
- Users can view dashboards, alerts, and generate reports
- Data includes: events, AI insights, alerts, metrics, regional distribution

Conversation history:
${conversationContext}

User question: ${message}

Provide a helpful, concise response. If the user asks for data analysis:
1. Acknowledge their request
2. Explain what analysis would be performed
3. Provide example insights they might see
4. Suggest follow-up questions

If you can provide specific data, format it clearly. Be conversational but professional.

Response:`;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Analyze response for suggestions
        const suggestions = generateSuggestions(message, response);

        return NextResponse.json({
            response,
            metadata: {
                suggestions,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

/**
 * Generate contextual suggestions based on conversation
 */
function generateSuggestions(userMessage: string, aiResponse: string): string[] {
    const suggestions: string[] = [];
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware suggestions
    if (lowerMessage.includes('anomal')) {
        suggestions.push(
            'Show me anomaly details',
            'What caused these anomalies?',
            'How can I prevent future anomalies?'
        );
    } else if (lowerMessage.includes('region')) {
        suggestions.push(
            'Compare regions over time',
            'Show regional trends',
            'Which regions have the most activity?'
        );
    } else if (lowerMessage.includes('report')) {
        suggestions.push(
            'Export this as PDF',
            'Schedule weekly reports',
            'Customize report format'
        );
    } else if (lowerMessage.includes('alert')) {
        suggestions.push(
            'Show alert history',
            'Configure alert thresholds',
            'Set up alert notifications'
        );
    } else {
        // Default suggestions
        suggestions.push(
            'Show me recent insights',
            'What are the current trends?',
            'Generate a summary report',
            'Show system health'
        );
    }

    return suggestions.slice(0, 4); // Return max 4 suggestions
}
