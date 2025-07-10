import { 
  users, 
  type User, 
  type InsertUser, 
  type DashboardMetric, 
  type InsertMetric,
  type ChatMessage,
  type InsertChatMessage,
  type DashboardWidget,
  type InsertWidget
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  getDashboardMetrics(userId: number): Promise<DashboardMetric[]>;
  createMetric(metric: InsertMetric): Promise<DashboardMetric>;
  
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getDashboardWidgets(userId: number): Promise<DashboardWidget[]>;
  createWidget(widget: InsertWidget): Promise<DashboardWidget>;
  updateWidget(id: number, updates: Partial<DashboardWidget>): Promise<DashboardWidget | undefined>;
  deleteWidget(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {

  constructor() {
    this.users = new Map();
    this.metrics = new Map();
    this.chatMessages = new Map();
    this.widgets = new Map();
    this.currentUserId = 1;
    this.currentMetricId = 1;
    this.currentMessageId = 1;
    this.currentWidgetId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      email: "demo@oraclio.com",
      password: "password123",
      companyName: "Acme Corp",
      role: "Owner",
      tools: ["Excel", "Slack", "Trello"],
      onboardingCompleted: true,
      createdAt: new Date()
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Create sample metrics
    const sampleMetrics: DashboardMetric[] = [
      {
        id: 1,
        userId: 1,
        metricType: "revenue",
        value: 125000,
        change: 12,
        period: "monthly",
        data: { previousValue: 112000, trend: "up" },
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        metricType: "expenses",
        value: 85000,
        change: -5,
        period: "monthly",
        data: { previousValue: 89500, trend: "down" },
        updatedAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        metricType: "sales",
        value: 42,
        change: 8,
        period: "monthly",
        data: { previousValue: 39, trend: "up", conversionRate: 3.2 },
        updatedAt: new Date()
      },
      {
        id: 4,
        userId: 1,
        metricType: "hr",
        value: 95,
        change: 2,
        period: "monthly",
        data: { previousValue: 93, trend: "up", turnoverRate: 5 },
        updatedAt: new Date()
      }
    ];

    sampleMetrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
    this.currentMetricId = 5;

    // Create sample widgets
    const sampleWidgets: DashboardWidget[] = [
      {
        id: 1,
        userId: 1,
        widgetType: "financial",
        title: "Financial Metrics",
        isEnabled: true,
        position: 0,
        config: { showTrends: true, currency: "USD" },
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        widgetType: "team_performance",
        title: "Team Performance",
        isEnabled: true,
        position: 1,
        config: { showSatisfaction: true, showTurnover: true },
        createdAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        widgetType: "recent_activities",
        title: "Recent Activities",
        isEnabled: true,
        position: 2,
        config: { maxItems: 5 },
        createdAt: new Date()
      },
      {
        id: 4,
        userId: 1,
        widgetType: "sales_funnel",
        title: "Sales Funnel",
        isEnabled: false,
        position: 3,
        config: { showConversion: true },
        createdAt: new Date()
      },
      {
        id: 5,
        userId: 1,
        widgetType: "tool_metrics",
        title: "Tool-specific Metrics",
        isEnabled: true,
        position: 4,
        config: { tools: ["Slack", "Trello"] },
        createdAt: new Date()
      }
    ];

    sampleWidgets.forEach(widget => {
      this.widgets.set(widget.id, widget);
    });
    this.currentWidgetId = 6;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      email: insertUser.email,
      password: insertUser.password,
      companyName: insertUser.companyName || null,
      role: insertUser.role || null,
      tools: insertUser.tools || null,
      id,
      onboardingCompleted: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDashboardMetrics(userId: number): Promise<DashboardMetric[]> {
    return Array.from(this.metrics.values()).filter(metric => metric.userId === userId);
  }

  async createMetric(metric: InsertMetric): Promise<DashboardMetric> {
    const id = this.currentMetricId++;
    const newMetric: DashboardMetric = {
      userId: metric.userId || null,
      metricType: metric.metricType,
      value: metric.value,
      change: metric.change || null,
      period: metric.period,
      data: metric.data || null,
      id,
      updatedAt: new Date()
    };
    this.metrics.set(id, newMetric);
    return newMetric;
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const newMessage: ChatMessage = {
      userId: message.userId || null,
      message: message.message,
      response: message.response,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getDashboardWidgets(userId: number): Promise<DashboardWidget[]> {
    return Array.from(this.widgets.values())
      .filter(widget => widget.userId === userId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  async createWidget(widget: InsertWidget): Promise<DashboardWidget> {
    const id = this.currentWidgetId++;
    const newWidget: DashboardWidget = {
      id,
      userId: widget.userId || null,
      widgetType: widget.widgetType,
      title: widget.title,
      isEnabled: widget.isEnabled ?? true,
      position: widget.position ?? 0,
      config: widget.config || null,
      createdAt: new Date()
    };
    this.widgets.set(id, newWidget);
    return newWidget;
  }

  async updateWidget(id: number, updates: Partial<DashboardWidget>): Promise<DashboardWidget | undefined> {
    const widget = this.widgets.get(id);
    if (!widget) return undefined;
    
    const updatedWidget = { ...widget, ...updates };
    this.widgets.set(id, updatedWidget);
    return updatedWidget;
  }

  async deleteWidget(id: number): Promise<boolean> {
    return this.widgets.delete(id);
  }
}

export const storage = new MemStorage();
