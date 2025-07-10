import {
  users,
  dashboardMetrics,
  chatMessages,
  dashboardWidgets,
  integrations,
  bitrixData,
  aiBots,
  botConversations,
  type User,
  type DashboardMetric,
  type ChatMessage,
  type DashboardWidget,
  type Integration,
  type BitrixData,
  type AiBot,
  type BotConversation,
  type InsertUser,
  type InsertMetric,
  type InsertChatMessage,
  type InsertWidget,
  type InsertIntegration,
  type InsertBitrixData,
  type InsertAiBot,
  type InsertBotConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateProfile(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  getDashboardMetrics(userId: number): Promise<DashboardMetric[]>;
  createMetric(metric: InsertMetric): Promise<DashboardMetric>;
  
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage & { response: string }): Promise<ChatMessage>;
  
  getDashboardWidgets(userId: number): Promise<DashboardWidget[]>;
  createWidget(widget: InsertWidget): Promise<DashboardWidget>;
  updateWidget(id: number, updates: Partial<DashboardWidget>): Promise<DashboardWidget | undefined>;
  deleteWidget(id: number): Promise<boolean>;
  
  // Integration methods
  getIntegrations(userId: number): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, updates: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;
  
  // Bitrix24 data methods
  getBitrixData(integrationId: number, dataType?: string): Promise<BitrixData[]>;
  createBitrixData(data: InsertBitrixData): Promise<BitrixData>;
  updateBitrixData(id: number, updates: Partial<BitrixData>): Promise<BitrixData | undefined>;
  deleteBitrixData(id: number): Promise<boolean>;
  
  // AI Bot methods
  getAiBots(userId: number): Promise<AiBot[]>;
  getAiBot(id: number): Promise<AiBot | undefined>;
  createAiBot(bot: InsertAiBot): Promise<AiBot>;
  updateAiBot(id: number, updates: Partial<AiBot>): Promise<AiBot | undefined>;
  deleteAiBot(id: number): Promise<boolean>;
  
  // Bot conversation methods
  getBotConversations(botId: number): Promise<BotConversation[]>;
  createBotConversation(conversation: InsertBotConversation & { response: string }): Promise<BotConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, createdAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateProfile(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Dashboard metrics operations
  async getDashboardMetrics(userId: number): Promise<DashboardMetric[]> {
    return await db
      .select()
      .from(dashboardMetrics)
      .where(eq(dashboardMetrics.userId, userId));
  }

  async createMetric(metric: InsertMetric): Promise<DashboardMetric> {
    const [newMetric] = await db
      .insert(dashboardMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // Chat messages operations
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(message: InsertChatMessage & { response: string }): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Dashboard widgets operations
  async getDashboardWidgets(userId: number): Promise<DashboardWidget[]> {
    return await db
      .select()
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.userId, userId))
      .orderBy(dashboardWidgets.position);
  }

  async createWidget(widget: InsertWidget): Promise<DashboardWidget> {
    const [newWidget] = await db
      .insert(dashboardWidgets)
      .values(widget)
      .returning();
    return newWidget;
  }

  async updateWidget(id: number, updates: Partial<DashboardWidget>): Promise<DashboardWidget | undefined> {
    const [widget] = await db
      .update(dashboardWidgets)
      .set(updates)
      .where(eq(dashboardWidgets.id, id))
      .returning();
    return widget;
  }

  async deleteWidget(id: number): Promise<boolean> {
    const result = await db
      .delete(dashboardWidgets)
      .where(eq(dashboardWidgets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Integration methods
  async getIntegrations(userId: number): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .orderBy(integrations.createdAt);
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));
    return integration;
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [newIntegration] = await db
      .insert(integrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateIntegration(id: number, updates: Partial<Integration>): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    const result = await db
      .delete(integrations)
      .where(eq(integrations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bitrix24 data methods
  async getBitrixData(integrationId: number, dataType?: string): Promise<BitrixData[]> {
    const baseQuery = db.select().from(bitrixData);
    
    if (dataType) {
      const data = await baseQuery.where(eq(bitrixData.integrationId, integrationId));
      return data.filter(item => item.dataType === dataType);
    }
    
    return await baseQuery.where(eq(bitrixData.integrationId, integrationId));
  }

  async createBitrixData(data: InsertBitrixData): Promise<BitrixData> {
    const [newData] = await db
      .insert(bitrixData)
      .values(data)
      .returning();
    return newData;
  }

  async updateBitrixData(id: number, updates: Partial<BitrixData>): Promise<BitrixData | undefined> {
    const [data] = await db
      .update(bitrixData)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(bitrixData.id, id))
      .returning();
    return data;
  }

  async deleteBitrixData(id: number): Promise<boolean> {
    const result = await db
      .delete(bitrixData)
      .where(eq(bitrixData.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Bot methods
  async getAiBots(userId: number): Promise<AiBot[]> {
    return await db.select().from(aiBots).where(eq(aiBots.userId, userId)).orderBy(desc(aiBots.createdAt));
  }

  async getAiBot(id: number): Promise<AiBot | undefined> {
    const result = await db.select().from(aiBots).where(eq(aiBots.id, id));
    return result[0];
  }

  async createAiBot(bot: InsertAiBot): Promise<AiBot> {
    // Generate system prompt from bot configuration
    const systemPrompt = this.generateSystemPrompt(bot);
    
    const result = await db.insert(aiBots).values({
      ...bot,
      systemPrompt
    }).returning();
    return result[0];
  }

  async updateAiBot(id: number, updates: Partial<AiBot>): Promise<AiBot | undefined> {
    // Regenerate system prompt if configuration changed
    let updateData = { ...updates };
    if (updates.name || updates.goal || updates.tone || updates.format || updates.dataSources || updates.outputActions || updates.examples) {
      updateData.systemPrompt = this.generateSystemPrompt(updateData as InsertAiBot);
    }

    const result = await db.update(aiBots)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(aiBots.id, id))
      .returning();
    return result[0];
  }

  async deleteAiBot(id: number): Promise<boolean> {
    const deleted = await db.delete(aiBots).where(eq(aiBots.id, id));
    return (deleted.rowCount ?? 0) > 0;
  }

  // Bot conversation methods
  async getBotConversations(botId: number): Promise<BotConversation[]> {
    return await db.select().from(botConversations)
      .where(eq(botConversations.botId, botId))
      .orderBy(desc(botConversations.timestamp));
  }

  async createBotConversation(conversation: InsertBotConversation & { response: string }): Promise<BotConversation> {
    const result = await db.insert(botConversations).values(conversation).returning();
    return result[0];
  }

  private generateSystemPrompt(bot: Partial<InsertAiBot>): string {
    return `You are a helpful and analytical AI assistant named "${bot.name}", designed to support small and medium businesses.

🎯 Purpose: ${bot.goal}

🔌 Data Sources: ${bot.dataSources?.join(', ')}
(Treat these as your source of truth. Only use what's available.)

💬 Response Style: ${bot.tone}
📄 Format your answers as: ${bot.format}

⛓️ Path Logic:
1. Pull data from: ${bot.dataSources?.join(', ')}
2. Analyze for business insights and patterns
3. Push result to: ${bot.outputActions?.join(', ')} ${bot.schedule ? `on ${bot.schedule}` : ''}

Always respond concisely, with clear breakdowns. When relevant, suggest what the user can improve.

Only answer based on the data context you're given. Never invent.

${bot.examples && bot.examples.length > 0 ? `Example tasks:\n${bot.examples.map(ex => `- ${ex}`).join('\n')}` : ''}`;
  }
}

export const storage = new DatabaseStorage();