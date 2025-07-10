import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatMessageSchema, insertWidgetSchema, insertAiBotSchema, insertBotConversationSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { generateBusinessResponse, type BusinessContext } from "./openai";
import { generateLocalBusinessResponse } from "./localAI";
import { generateAnthropicResponse } from "./anthropic";
import { searchBitrix } from "./bitrix";
import { nlpProcessor, type BotIntent, type BotWorkflow } from "./nlp";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          company: user.company,
          role: user.role,
          tools: user.tools,
          onboardingCompleted: user.onboardingCompleted
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Compare password with hashed password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          companyName: user.companyName,
          role: user.role,
          tools: user.tools,
          onboardingCompleted: user.onboardingCompleted
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Login failed" });
    }
  });

  // User routes
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: updatedUser.id, 
          email: updatedUser.email, 
          companyName: updatedUser.companyName,
          role: updatedUser.role,
          tools: updatedUser.tools,
          onboardingCompleted: updatedUser.onboardingCompleted
        } 
      });
    } catch (error) {
      res.status(400).json({ error: "Update failed" });
    }
  });

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    // For now, use a hardcoded user ID until session is properly implemented
    const userId = 3; // This matches the user in your system
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/corporate-search", async (req, res) => {
    try {
      const { query, userId } = req.body;

      if (!query || !userId) {
        return res.status(400).json({ error: 'Query and userId are required' });
      }

      // 1. Search Bitrix24 for relevant information
      const bitrixData = await searchBitrix(query);

      // 2. Prepare the context for the AI model
      const context: BusinessContext = {
        companyName: 'Your Company Name', // This could be fetched from user data
        userRole: 'Sales Representative', // This could be fetched from user data
        metrics: [], // Placeholder for metrics data
        salesData: bitrixData.deals.map(d => ({ title: d.TITLE, opportunity: d.OPPORTUNITY, comments: d.COMMENTS })),
        teamPerformance: [], // Placeholder for team performance data
        topCustomers: [], // Placeholder for top customers data
        recentActivities: bitrixData.tasks.map(t => ({ title: t.title, description: t.description, status: t.status }))
      };

      // 3. Generate a response using the OpenAI service
      const response = await generateBusinessResponse(query, context);

      res.json({ response });
    } catch (error) {
      console.error('Corporate search error:', error);
      res.status(500).json({ error: 'Failed to perform corporate search' });
    }
  });

  app.put("/api/profile", async (req, res) => {
    // For now, use a hardcoded user ID until session is properly implemented
    const userId = 3; // This matches the user in your system
    
    try {
      const updates = req.body;
      delete updates.id; // Don't allow ID updates
      delete updates.password; // Don't allow password updates here
      delete updates.createdAt; // Don't allow creation date updates
      
      const user = await storage.updateProfile(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // In a real application, you would fetch this data from a database.
      // For now, we'll use mock data.
      const mockData = {
        metrics: [
          {
            title: 'New subscriptions',
            value: '22',
            change: '+15%',
            changeType: 'increase',
            comparison: 'compared to last week',
            data: [{ value: 10 }, { value: 15 }, { value: 12 }, { value: 18 }, { value: 20 }, { value: 22 }],
            color: '#8b5cf6',
          },
          {
            title: 'New orders',
            value: '320',
            change: '-4%',
            changeType: 'decrease',
            comparison: 'compared to last week',
            data: [{ value: 350 }, { value: 340 }, { value: 330 }, { value: 325 }, { value: 320 }, { value: 320 }],
            color: '#f97316',
          },
          {
            title: 'Avg. order revenue',
            value: '$1,080',
            change: '+8%',
            changeType: 'increase',
            comparison: 'compared to last week',
            data: [{ value: 950 }, { value: 980 }, { value: 1000 }, { value: 1020 }, { value: 1050 }, { value: 1080 }],
            color: '#8b5cf6',
          },
        ],
        campaigns: {
          draft: [
            {
              platform: 'Facebook',
              icon: 'Facebook',
              title: '10 Simple steps to revolutionise workflows with our product',
              status: 'Not Started',
              updated: 'Apr 10, 2023',
              avatars: ['/avatars/01.png', '/avatars/02.png', '/avatars/03.png'],
            },
          ],
          inProgress: [
            {
              platform: 'Google',
              icon: 'Google',
              title: 'Boost your performance: start using our amazing product',
              status: 'In Progress',
              progress: 66,
              start: 'Jun 1, 2023',
              ends: 'Aug 1, 2023',
              updated: 'July 10, 2023',
              avatars: ['/avatars/04.png', '/avatars/05.png'],
            },
          ],
          archived: [
            {
              platform: 'Google',
              icon: 'Google',
              title: 'The power of our product: A new era in SaaS',
              status: 'Ended',
              ended: 'Jun 11, 2023',
              updated: 'Apr 10, 2023',
              avatars: ['/avatars/01.png', '/avatars/02.png', '/avatars/03.png', '/avatars/04.png'],
            },
          ],
        }
      };

      res.json(mockData);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch metrics" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessages(userId);
      res.json({ messages });
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Get business context for AI response
      const userId = messageData.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const metrics = await storage.getDashboardMetrics(userId);
      
      // Get user information for personalized context
      const user = await storage.getUser(userId);
      
      // Get conversation history for context
      const existingMessages = await storage.getChatMessages(userId);
      const conversationHistory = existingMessages.filter(msg => msg.response).map(msg => [
        { role: "user", content: msg.message, timestamp: msg.timestamp || new Date() },
        { role: "assistant", content: msg.response!, timestamp: msg.timestamp || new Date() }
      ]).flat();
      
      // Get real business context from Bitrix24 integration and database
      const businessContext: BusinessContext = await getRealBusinessContext(userId, metrics);
      
      // Add user context for personalization
      businessContext.userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined;
      businessContext.companyName = (user?.company || user?.companyName) ?? undefined;
      businessContext.userRole = user?.role ?? undefined;
      businessContext.conversationHistory = conversationHistory;
      
      // Generate AI response with enhanced business context (fallback chain: OpenAI -> Anthropic -> Local)
      let aiResponse: string;
      try {
        aiResponse = await generateBusinessResponse(messageData.message, businessContext);
      } catch (openaiError) {
        console.log("OpenAI unavailable, trying Anthropic Claude...");
        try {
          aiResponse = await generateAnthropicResponse(messageData.message, businessContext);
          console.log("Anthropic response generated successfully");
        } catch (anthropicError) {
          console.log("All AI APIs unavailable, using local business intelligence");
          aiResponse = generateLocalBusinessResponse(messageData.message, businessContext);
        }
      }
      
      const message = await storage.createChatMessage({
        userId: messageData.userId,
        message: messageData.message,
        response: aiResponse
      });
      
      res.json({ message });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(400).json({ error: "Failed to send message" });
    }
  });

  // Widget routes
  app.get("/api/widgets", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const widgets = await storage.getDashboardWidgets(userId);
      res.json({ widgets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch widgets" });
    }
  });

  app.post("/api/widgets", async (req, res) => {
    try {
      const widgetData = insertWidgetSchema.parse(req.body);
      const widget = await storage.createWidget(widgetData);
      res.json({ widget });
    } catch (error) {
      res.status(400).json({ error: "Failed to create widget" });
    }
  });

  app.put("/api/widgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const widget = await storage.updateWidget(id, updates);
      if (!widget) {
        return res.status(404).json({ error: "Widget not found" });
      }
      
      res.json({ widget });
    } catch (error) {
      res.status(400).json({ error: "Failed to update widget" });
    }
  });

  app.delete("/api/widgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWidget(id);
      
      if (!success) {
        return res.status(404).json({ error: "Widget not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete widget" });
    }
  });

  // Integration routes
  app.get("/api/integrations", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const integrations = await storage.getIntegrations(userId);
      res.json({ integrations });
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const integration = await storage.createIntegration(req.body);
      res.json({ integration });
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  app.post("/api/integrations/:id/test", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }

      if (integration.service === "bitrix24") {
        // Use apiKey field which contains the webhook URL
        const webhookUrl = integration.apiKey || integration.apiUrl;
        console.log('Testing integration with URL:', webhookUrl);
        
        // Test connection first
        const appInfo = await fetchBitrixData(webhookUrl!, 'app.info', {});
        
        // Try to fetch sample data with error handling
        let deals = [];
        let contacts = [];
        
        try {
          // Try simple request without complex filters first
          deals = await fetchBitrixData(webhookUrl!, 'crm.deal.list', {});
          console.log('Deals fetched:', deals?.length || 0, 'items');
          if (deals && deals.length > 0) {
            console.log('First deal:', JSON.stringify(deals[0], null, 2));
          }
        } catch (error) {
          console.log('Could not fetch deals:', error);
          // Try alternative method
          try {
            deals = await fetchBitrixData(webhookUrl!, 'crm.deal.list', { 
              order: { 'ID': 'DESC' },
              filter: {},
              start: 0
            });
            console.log('Alternative deals fetch:', deals?.length || 0, 'items');
          } catch (altError) {
            console.log('Alternative deals fetch failed:', altError);
          }
        }
        
        try {
          contacts = await fetchBitrixData(webhookUrl!, 'crm.contact.list', {});
          console.log('Contacts fetched:', contacts?.length || 0, 'items');
        } catch (error) {
          console.log('Could not fetch contacts:', error);
        }
        
        const result = {
          connection: appInfo,
          deals: deals || [],
          contacts: contacts || [],
          summary: {
            dealsCount: deals?.length || 0,
            contactsCount: contacts?.length || 0
          }
        };
        
        console.log('Final result being sent to client:', {
          dealsCount: result.summary.dealsCount,
          contactsCount: result.summary.contactsCount,
          actualDealsLength: result.deals?.length,
          actualContactsLength: result.contacts?.length
        });
        
        res.json({ success: true, data: result });
      } else {
        res.status(400).json({ error: "Unsupported integration service" });
      }
    } catch (error: any) {
      console.error("Error testing integration:", error);
      res.status(500).json({ error: "Failed to test integration", details: error.message });
    }
  });

  app.post("/api/integrations/:id/sync", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }

      if (integration.service === "bitrix24") {
        // Use apiKey field which contains the webhook URL
        const webhookUrl = integration.apiKey || integration.apiUrl;
        const integrationWithCorrectUrl = { ...integration, apiUrl: webhookUrl };
        const dealsCount = await syncBitrixDeals(integrationWithCorrectUrl);
        
        await storage.updateIntegration(integrationId, { lastSync: new Date() });
        
        res.json({ success: true, synced: dealsCount });
      } else {
        res.status(400).json({ error: "Unsupported integration service" });
      }
    } catch (error: any) {
      console.error("Error syncing integration:", error);
      res.status(500).json({ error: "Failed to sync integration", details: error.message });
    }
  });

  app.delete("/api/integrations/:id", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const success = await storage.deleteIntegration(integrationId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Integration not found" });
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  // Bitrix24 data routes
  app.get("/api/bitrix-data/:integrationId", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      const dataType = req.query.type as string;
      
      const data = await storage.getBitrixData(integrationId, dataType);
      res.json({ data });
    } catch (error) {
      console.error("Error fetching Bitrix data:", error);
      res.status(500).json({ error: "Failed to fetch Bitrix data" });
    }
  });

  // AI Bot routes
  app.get("/api/ai-bots", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const bots = await storage.getAiBots(userId);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  // NLP Bot Creation Endpoint
  app.post("/api/ai-bots/process-nlp", async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ error: "Message and user ID required" });
      }

      // Extract intent from natural language
      const intent: BotIntent = nlpProcessor.extractIntent(message);
      
      // Generate workflow from intent
      const workflow: BotWorkflow = nlpProcessor.generateWorkflow(intent);
      
      // Generate AI explanation
      const explanation = await nlpProcessor.generateBotExplanation(workflow);
      
      // Get improvement suggestions
      const suggestions = nlpProcessor.suggestImprovements(workflow);

      res.json({
        intent,
        workflow,
        explanation,
        suggestions
      });
    } catch (error) {
      console.error("Error processing NLP request:", error);
      res.status(500).json({ error: "Failed to process bot request" });
    }
  });

  app.post("/api/ai-bots", async (req, res) => {
    try {
      const botData = insertAiBotSchema.parse(req.body);
      const bot = await storage.createAiBot(botData);
      res.json({ bot });
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(400).json({ error: "Failed to create bot" });
    }
  });

  app.get("/api/ai-bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bot = await storage.getAiBot(id);
      
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ error: "Failed to fetch bot" });
    }
  });

  app.put("/api/ai-bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const bot = await storage.updateAiBot(id, updates);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      res.json({ bot });
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  app.delete("/api/ai-bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAiBot(id);
      
      if (!success) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(400).json({ error: "Failed to delete bot" });
    }
  });

  // Bot conversation routes
  app.get("/api/ai-bots/:id/conversations", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const conversations = await storage.getBotConversations(botId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/bots/:id/chat", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const { message, userId } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ error: "Message and userId required" });
      }

      // Get bot configuration
      const bot = await storage.getAiBot(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      // Get business context for the bot
      const businessContext = await getRealBusinessContext(userId, []);
      
      // Generate AI response using the bot's system prompt
      let response: string;
      try {
        response = await generateBusinessResponse(
          message,
          businessContext
        );
      } catch (aiError) {
        console.warn("OpenAI API failed, using local AI:", aiError);
        response = generateLocalBusinessResponse(message, businessContext);
      }

      // Save conversation
      const conversation = await storage.createBotConversation({
        botId,
        userId,
        message,
        response,
        context: businessContext as any
      });

      res.json({ response, conversation });
    } catch (error) {
      console.error("Error in bot chat:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Function to get real business context from Bitrix24 and database
async function getRealBusinessContext(userId: number, metrics: any[]): Promise<BusinessContext> {
  try {
    // Get user's Bitrix24 integrations
    const integrations = await storage.getIntegrations(userId);
    const bitrixIntegration = integrations.find(i => i.service === 'bitrix24' && i.isActive);
    
    let salesData: any[] = [];
    let topCustomers: any[] = [];
    let recentActivities: any[] = [];
    
    if (bitrixIntegration && bitrixIntegration.apiKey) {
      // Fetch real Bitrix24 data
      const webhookUrl = bitrixIntegration.apiKey;
      
      try {
        // Get deals data using simpler parameters to avoid 400 error
        const dealsResponse = await fetchBitrixData(webhookUrl, 'crm.deal.list', {});
        console.log("Bitrix deals response:", dealsResponse);
        
        if (dealsResponse && dealsResponse.result && Array.isArray(dealsResponse.result)) {
          const deals = dealsResponse.result;
          console.log(`Successfully found ${deals.length} deals from Bitrix24`);
          
          // Convert deals to sales data - use RUB from your Bitrix24
          const totalRevenue = deals.reduce((sum: number, deal: any) => 
            sum + (parseFloat(deal.OPPORTUNITY) || 0), 0
          );
          
          // Clear existing sales data and add real Bitrix data
          salesData = [{
            month: "Current", 
            revenue: Math.round(totalRevenue), 
            customers: deals.length, 
            deals: deals.length 
          }];
          
          console.log(`✅ Real Bitrix24 data loaded: ${deals.length} deals, ${totalRevenue} RUB revenue`);
          
          // Get top deals as customers with RUB values
          topCustomers = deals
            .sort((a: any, b: any) => (parseFloat(b.OPPORTUNITY) || 0) - (parseFloat(a.OPPORTUNITY) || 0))
            .slice(0, 3)
            .map((deal: any) => ({
              name: deal.TITLE || `Сделка #${deal.ID}`,
              revenue: `${(parseFloat(deal.OPPORTUNITY) || 0).toLocaleString()} RUB`,
              growth: "+0%",
              plan: deal.STAGE_ID || "Unknown",
              users: 1
            }));
          
          // Recent activities from recent deals  
          recentActivities = deals.slice(0, 3).map((deal: any) => ({
            type: "sale",
            message: `Сделка "${deal.TITLE}" - ${(parseFloat(deal.OPPORTUNITY) || 0).toLocaleString()} RUB`,
            time: "Недавно",
            value: `${(parseFloat(deal.OPPORTUNITY) || 0).toLocaleString()} RUB`
          }));
          
          console.log(`✅ Created ${topCustomers.length} customers and ${recentActivities.length} activities from real data`);
        } else {
          console.log("❌ No valid deals data received from Bitrix24");
        }
        
        // Get contacts data
        const contactsResponse = await fetchBitrixData(webhookUrl, 'crm.contact.list', {});
        
        if (contactsResponse.result && contactsResponse.result.length > 0) {
          // Add contact info to activities
          recentActivities.push({
            type: "user",
            message: `${contactsResponse.result.length} contacts in CRM`,
            time: "Current",
            value: `${contactsResponse.result.length}`
          });
        }
        
      } catch (bitrixError) {
        console.log("Error fetching Bitrix data:", bitrixError);
        console.log("Webhook URL used:", webhookUrl);
      }
    }
    
    // Log what we got from Bitrix24
    console.log("Final salesData length:", salesData.length);
    console.log("Bitrix integration status:", bitrixIntegration ? "Found" : "Not found");
    
    // If no Bitrix data, show connection status instead of fake data
    if (salesData.length === 0) {
      salesData = [
        { month: "Current", revenue: 0, customers: 0, deals: 0 }
      ];
      console.log("No Bitrix data received, using empty data");
    }
    
    if (topCustomers.length === 0) {
      topCustomers = [
        { name: "Подключите Bitrix24", revenue: "$0", growth: "0%", plan: "Нет данных", users: 0 }
      ];
    }
    
    if (recentActivities.length === 0) {
      recentActivities = [
        { type: "alert", message: "Подключите Bitrix24 для анализа реальных данных", time: "Сейчас", value: "Настройка" }
      ];
    }
    
    return {
      metrics: metrics,
      salesData: salesData,
      teamPerformance: [
        { team: "Sales", target: 100, achieved: 112, members: 8, efficiency: "112%" },
        { team: "Marketing", target: 85, achieved: 94, members: 6, efficiency: "110%" },
        { team: "Customer Success", target: 95, achieved: 98, members: 12, efficiency: "103%" },
        { team: "Product", target: 90, achieved: 87, members: 15, efficiency: "97%" },
        { team: "Engineering", target: 88, achieved: 92, members: 22, efficiency: "105%" }
      ],
      topCustomers: topCustomers,
      recentActivities: recentActivities
    };
    
  } catch (error) {
    console.error("Error getting business context:", error);
    
    // Return sample data as fallback
    return {
      metrics: metrics,
      salesData: [
        { month: "Jun", revenue: 87000, customers: 1590, deals: 58 }
      ],
      teamPerformance: [
        { team: "Sales", target: 100, achieved: 112, members: 8, efficiency: "112%" }
      ],
      topCustomers: [
        { name: "No Bitrix Connection", revenue: "$0", growth: "0%", plan: "Connect Bitrix24", users: 0 }
      ],
      recentActivities: [
        { type: "alert", message: "Connect Bitrix24 for real-time data", time: "Now", value: "Setup" }
      ]
    };
  }
}

// Helper functions for Bitrix24 integration

// Bitrix24 API helper functions
async function fetchBitrixData(apiUrl: string, method: string, params: any = {}) {
  try {
    // Clean and validate the URL
    let cleanUrl = apiUrl.trim().replace(/\s+/g, ''); // Remove all spaces
    
    // Ensure URL has protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // For Bitrix24, we need to handle webhook URLs differently
    let finalUrl: string;
    
    if (cleanUrl.includes('/rest/')) {
      // This is a webhook URL like https://domain.bitrix24.ru/rest/1/abc123/
      if (cleanUrl.endsWith('/')) {
        finalUrl = `${cleanUrl}${method}/`;
      } else {
        finalUrl = `${cleanUrl}/${method}/`;
      }
    } else {
      // Standard domain, construct webhook-style URL
      finalUrl = `${cleanUrl}/rest/1/dummy/${method}/`;
    }
    
    const url = new URL(finalUrl);
    
    // Add parameters as query string
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]);
      }
    });
    
    console.log('Fetching Bitrix24 URL:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Bitrix24 API Error:', error);
    throw error;
  }
}

async function syncBitrixDeals(integration: any) {
  try {
    const deals = await fetchBitrixData(integration.apiUrl, 'crm.deal.list', {
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'DATE_CREATE', 'DATE_MODIFY'],
      order: { DATE_MODIFY: 'DESC' },
      filter: { '>DATE_MODIFY': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } // Last 30 days
    });

    for (const deal of deals) {
      await storage.createBitrixData({
        integrationId: integration.id,
        dataType: 'deals',
        externalId: deal.ID,
        title: deal.TITLE,
        data: deal
      });
    }

    return deals.length;
  } catch (error) {
    console.error('Error syncing Bitrix deals:', error);
    throw error;
  }
}
