import { GoogleGenerativeAI } from '@google/generative-ai';
import { TimeWindow, AIInsight } from '../types';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const SYSTEM_PROMPT = `You are an AI analyst for a real-time transaction monitoring system.

Your task:
1. Analyze the provided transaction data for anomalies
2. Detect unusual patterns: spikes, drops, regional anomalies, suspicious behavior
3. Provide clear, actionable insights in professional language

Input: JSON array of aggregated transaction metrics over time windows

Output: JSON object with this exact structure:
{
  "status": "NORMAL" | "ANOMALY",
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Brief explanation of findings (max 150 chars)",
  "possible_causes": ["cause1", "cause2"],
  "recommended_action": "What should be done"
}

Rules:
- Be concise and specific
- Use percentages for changes
- Mention time ranges and regions
- Only flag real anomalies, not normal variance
- Compare current window to baseline (average of previous windows)
- A spike of >200% is HIGH severity
- A spike of 100-200% is MEDIUM severity
- A spike of 50-100% is LOW severity
- Regional concentration (>60% from one region) is suspicious`;

export async function analyzeWithGemini(windows: TimeWindow[]): Promise<AIInsight> {
    try {
        // Calculate baseline from all windows except the last one
        const baselineWindows = windows.slice(0, -1);
        const latestWindow = windows[windows.length - 1];

        const baseline = {
            avg_count: baselineWindows.reduce((sum, w) => sum + w.count, 0) / baselineWindows.length,
            avg_amount: baselineWindows.reduce((sum, w) => sum + w.avg_amount, 0) / baselineWindows.length
        };

        const analysisData = {
            time_range: {
                start: windows[0].timestamp,
                end: latestWindow.timestamp
            },
            windows: windows.map(w => ({
                timestamp: w.timestamp,
                count: w.count,
                total_amount: w.total_amount,
                avg_amount: w.avg_amount,
                regions: w.regions,
                types: w.types
            })),
            baseline: {
                avg_count_per_minute: Math.round(baseline.avg_count),
                avg_amount: Math.round(baseline.avg_amount * 100) / 100
            },
            latest: {
                count: latestWindow.count,
                avg_amount: latestWindow.avg_amount,
                regions: latestWindow.regions
            }
        };

        const prompt = `${SYSTEM_PROMPT}

Analyze this transaction data:

${JSON.stringify(analysisData, null, 2)}

Provide your analysis in the exact JSON format specified. Return ONLY the JSON object, no additional text.`;

        logger.debug('Sending request to Gemini...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        logger.debug(`Gemini response: ${text}`);

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const aiResponse = JSON.parse(jsonText);

        // Add metadata
        const insight: AIInsight = {
            ...aiResponse,
            timestamp: new Date().toISOString(),
            analyzed_period: {
                start: windows[0].timestamp,
                end: latestWindow.timestamp
            }
        };

        return insight;

    } catch (error) {
        logger.error('Error calling Gemini API:', error);

        // Return fallback response
        return {
            status: 'NORMAL',
            severity: 'LOW',
            summary: 'Analysis temporarily unavailable',
            possible_causes: ['API error'],
            recommended_action: 'Continue monitoring',
            timestamp: new Date().toISOString(),
            analyzed_period: {
                start: windows[0]?.timestamp || new Date().toISOString(),
                end: windows[windows.length - 1]?.timestamp || new Date().toISOString()
            }
        };
    }
}
