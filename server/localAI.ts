import { BusinessContext } from "./openai";
import { generateIntelligentResponse } from "./conversationEngine";

export function generateLocalBusinessResponse(
  userMessage: string, 
  context: BusinessContext
): string {
  // Use the new intelligent conversation engine that handles all conversation types naturally
  return generateIntelligentResponse(userMessage, context);
}