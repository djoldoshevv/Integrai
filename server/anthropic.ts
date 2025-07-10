import Anthropic from '@anthropic-ai/sdk';
import { BusinessContext } from './openai';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateAnthropicResponse(
  userMessage: string,
  context: BusinessContext
): Promise<string> {
  try {
    const systemPrompt = `You are Oraclio AI, an intelligent business assistant integrated into the Oraclio platform. You have access to real business data and can provide comprehensive analysis.

Current Context:
- User: ${context.userName || 'User'} at ${context.companyName || 'their company'}
- Role: ${context.userRole || 'Team Member'}
- You have access to real business metrics, sales data, team performance, and customer information

Key Capabilities:
- Analyze business performance using real data
- Answer general knowledge questions (geography, math, science, etc.)
- Provide conversational responses and engage naturally
- Offer business insights and recommendations
- Remember conversation context and maintain personalized interactions

Always be conversational, helpful, and knowledgeable. You can discuss any topic while maintaining access to business intelligence when relevant.`;

    const conversationHistory = context.conversationHistory || [];
    const messages = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: systemPrompt,
      max_tokens: 1024,
      temperature: 0.7,
      messages: messages as any[],
    });

    const contentBlock = response.content[0];
    const responseText = contentBlock && 'text' in contentBlock ? contentBlock.text : 'I apologize, but I encountered an issue generating a response.';
    
    // Add business context if the question seems business-related
    if (isBusinessQuery(userMessage)) {
      return enhanceWithBusinessContext(responseText, context);
    }
    
    return responseText;
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}

function isBusinessQuery(message: string): boolean {
  const businessKeywords = [
    'sales', 'revenue', 'deals', 'customers', 'business', 'performance',
    'metrics', 'analytics', 'dashboard', 'bitrix', 'crm', 'team',
    'profit', 'expenses', 'growth', 'targets', 'goals'
  ];
  
  return businessKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}

function enhanceWithBusinessContext(response: string, context: BusinessContext): string {
  const salesData = context.salesData || [];
  const totalRevenue = salesData.reduce((sum, deal) => sum + (deal.value || 0), 0);
  
  if (salesData.length > 0) {
    const contextInfo = `\n\nBased on your current business data: You have ${salesData.length} active deals worth ${totalRevenue.toLocaleString()} RUB in your CRM.`;
    return response + contextInfo;
  }
  
  return response;
}