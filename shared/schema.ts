import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  company: text("company"),
  companyName: text("company_name"),
  position: text("position"),
  department: text("department"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  role: text("role"),
  tools: text("tools", { mode: 'json' }).$type<string[]>(),
  onboardingCompleted: integer("onboarding_completed", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const dashboardMetrics = sqliteTable("dashboard_metrics", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  metricType: text("metric_type").notNull(), // 'revenue', 'expenses', 'sales', 'hr', 'ops'
  value: integer("value").notNull(),
  change: integer("change"), // percentage change
  period: text("period").notNull(), // 'monthly', 'quarterly', 'yearly'
  data: text("data", { mode: 'json' }), // additional metric data
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(new Date()),
});

export const dashboardWidgets = sqliteTable("dashboard_widgets", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  widgetType: text("widget_type").notNull(), // 'financial', 'team_performance', 'recent_activities', 'sales_funnel', 'tool_metrics'
  title: text("title").notNull(),
  isEnabled: integer("is_enabled", { mode: 'boolean' }).default(true),
  position: integer("position").default(0),
  config: text("config", { mode: 'json' }), // widget-specific configuration
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const integrations = sqliteTable("integrations", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: text("service").notNull(), // "bitrix24", "slack", etc.
  serviceName: text("service_name").notNull(),
  apiUrl: text("api_url"),
  apiKey: text("api_key"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  config: text("config", { mode: 'json' }), // Additional service-specific configuration
  lastSync: integer("last_sync", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

export const bitrixData = sqliteTable("bitrix_data", {
  id: integer("id").primaryKey(),
  integrationId: integer("integration_id").references(() => integrations.id),
  dataType: text("data_type").notNull(), // "deals", "contacts", "companies", etc.
  externalId: text("external_id").notNull(),
  title: text("title"),
  data: text("data", { mode: 'json' }).notNull(), // Full object data from Bitrix24
  lastUpdated: integer("last_updated", { mode: 'timestamp' }).default(new Date()),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const aiBots = sqliteTable("ai_bots", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  tone: text("tone").notNull().default("Friendly and professional"),
  format: text("format").notNull().default("Bullet points"),
  dataSources: text("data_sources", { mode: 'json' }).$type<string[]>().notNull(),
  outputActions: text("output_actions", { mode: 'json' }).$type<string[]>().notNull(),
  schedule: text("schedule").default("On demand"), // "Daily", "Weekly", "On demand"
  examples: text("examples", { mode: 'json' }).$type<string[]>(),
  systemPrompt: text("system_prompt"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

export const botConversations = sqliteTable("bot_conversations", {
  id: integer("id").primaryKey(),
  botId: integer("bot_id").references(() => aiBots.id),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  context: text("context", { mode: 'json' }), // Business data context used
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(new Date()),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  onboardingCompleted: true,
});

export const insertMetricSchema = createInsertSchema(dashboardMetrics).omit({
  id: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
  response: true,
});

export const insertWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBitrixDataSchema = createInsertSchema(bitrixData).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertAiBotSchema = createInsertSchema(aiBots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  systemPrompt: true,
});

export const insertBotConversationSchema = createInsertSchema(botConversations).omit({
  id: true,
  timestamp: true,
  response: true,
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  chartType: text("chart_type").notNull(),
  dataSource: text("data_source").notNull(),
  dateRange: text("date_range").notNull(),
  frequency: text("frequency").notNull(),
  isEnabled: integer("is_enabled", { mode: 'boolean' }).default(true),
  config: text("config", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  lastGenerated: integer("last_generated", { mode: 'timestamp' }),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  lastGenerated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type BitrixData = typeof bitrixData.$inferSelect;
export type InsertBitrixData = z.infer<typeof insertBitrixDataSchema>;
export type AiBot = typeof aiBots.$inferSelect;
export type InsertAiBot = z.infer<typeof insertAiBotSchema>;
export type BotConversation = typeof botConversations.$inferSelect;
export type InsertBotConversation = z.infer<typeof insertBotConversationSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
