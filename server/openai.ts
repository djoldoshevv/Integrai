import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | undefined;

/* Checking if OPENAI_API_KEY is set */
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
} else {
  console.warn("OPENAI_API_KEY is not set. OpenAI features will be disabled and mock data will be used.");
}

/* Interface for business context */
export interface BusinessContext {
  metrics: any[];
  salesData: any[];
  teamPerformance: any[];
  topCustomers: any[];
  recentActivities: any[];
  userRole?: string;
  userName?: string;
  companyName?: string;
  conversationHistory?: Array<{ role: string; content: string; timestamp: Date }>;
}

/* Function to generate business response */
export async function generateBusinessResponse(
  userMessage: string, 
  context: BusinessContext
): Promise<string> {
  if (!openai) {
    return "This is a mock response from Oraclio AI. To enable real AI responses, please set the OPENAI_API_KEY environment variable.";
  }
  try {
    // Build conversation history for context
    const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
    
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      // Include last 5 messages for context
      const recentHistory = context.conversationHistory.slice(-5);
      conversationMessages.push(...recentHistory.map(msg => ({
        role: (msg.role === "user" || msg.role === "assistant") ? msg.role as "user" | "assistant" : "user",
        content: msg.content
      })));
    }

    const userInfo = context.userName ? `User: ${context.userName}` : '';
    const companyInfo = context.companyName ? `Company: ${context.companyName}` : '';
    const roleInfo = context.userRole ? `Role: ${context.userRole}` : '';

    // Dynamically build the data context string to make the prompt cleaner
    const dataSections = [];
    if (context.metrics && context.metrics.length > 0) {
      dataSections.push(`- Current metrics: ${JSON.stringify(context.metrics)}`);
    }
    if (context.salesData && context.salesData.length > 0) {
      dataSections.push(`- Sales data: ${JSON.stringify(context.salesData)}`);
    }
    if (context.teamPerformance && context.teamPerformance.length > 0) {
      dataSections.push(`- Team performance: ${JSON.stringify(context.teamPerformance)}`);
    }
    if (context.topCustomers && context.topCustomers.length > 0) {
      dataSections.push(`- Top customers: ${JSON.stringify(context.topCustomers)}`);
    }
    if (context.recentActivities && context.recentActivities.length > 0) {
      dataSections.push(`- Recent activities: ${JSON.stringify(context.recentActivities)}`);
    }

    const availableData = dataSections.length > 0 
      ? dataSections.join('\n') 
      : 'No specific data was found for this query. You can still answer general questions.';

    const systemPrompt = `You are Oraclio AI, an advanced business intelligence assistant created for the Oraclio platform. Always identify yourself as "Oraclio AI" when asked who you are. You're helpful, knowledgeable, and conversational while being data-driven.

Important limitations: You don't have access to real-time information like current date, time, weather, or internet browsing. You work with business data from user integrations like Bitrix24 CRM systems. Focus on analyzing the provided business context and data.

${userInfo ? userInfo : ''}
${companyInfo ? companyInfo : ''}
${roleInfo ? roleInfo : ''}

Your primary instruction is to answer the user's question based *only* on the business data provided below.
- If the data is sufficient, provide a detailed, data-driven answer.
- If the data is insufficient or no data is provided, clearly state that and explain what information would be needed to answer the question. Do not invent data or make assumptions.

Available business data:
${availableData}

Your capabilities:
1. Answer business questions using real data from integrated systems
2. Provide insights, trends, and actionable recommendations
3. Engage in natural conversation about general topics when appropriate
4. Help with business strategy, analytics, and decision-making
5. Explain complex data in simple terms
6. Remember conversation context and provide personalized responses

Communication style:
- Be conversational and friendly like ChatGPT
- Use the user's name when appropriate
- Provide thorough explanations with specific data points
- Give actionable insights and next steps
- If asked about non-business topics, engage naturally while steering back to business value
- When data is insufficient, explain what additional information would be helpful

Always be helpful, accurate, and engaging in your responses.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
        { role: "user", content: userMessage }
      ],
      temperature: 0.7, // Balanced creativity for natural conversation
      max_tokens: 800, // More space for detailed responses
    });

    return response.choices[0].message.content || "I'm having trouble generating a response right now. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/* Function to analyze sentiment */
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  if (!openai) {
    return { rating: 3, confidence: 0.5 };
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0, // Zero creativity for consistent analysis
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    throw new Error("Failed to analyze sentiment: " + (error as Error).message);
  }
}