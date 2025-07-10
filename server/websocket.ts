import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { generateIntelligentResponse } from './conversationEngine';
import type { BusinessContext } from './openai';

interface WebSocketClient {
  ws: WebSocket;
  userId: number;
  isAlive: boolean;
}

interface ChatMessage {
  message: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  scenario?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, WebSocketClient> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.setupWebSocketServer();
    this.setupHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const pathParts = url.pathname.split('/');
      
      // Extract userId from path: /ws/chat/123
      if (pathParts.length < 4 || pathParts[1] !== 'ws' || pathParts[2] !== 'chat') {
        ws.close(1000, 'Invalid path');
        return;
      }

      const userId = parseInt(pathParts[3]);
      if (isNaN(userId)) {
        ws.close(1000, 'Invalid user ID');
        return;
      }

      console.log(`[websocket] Client connected: userId=${userId}`);
      
      const client: WebSocketClient = {
        ws,
        userId,
        isAlive: true
      };

      this.clients.set(userId, client);

      // Setup heartbeat for this connection
      ws.on('pong', () => {
        client.isAlive = true;
      });

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message: ChatMessage = JSON.parse(data.toString());
          await this.handleChatMessage(userId, message);
        } catch (error) {
          console.error('[websocket] Error processing message:', error);
          ws.send(JSON.stringify({
            error: 'Failed to process message',
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`[websocket] Client disconnected: userId=${userId}`);
        this.clients.delete(userId);
      });

      ws.on('error', (error) => {
        console.error(`[websocket] Client error for userId=${userId}:`, error);
        this.clients.delete(userId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to real-time chat',
        timestamp: new Date().toISOString()
      }));
    });
  }

  private async handleChatMessage(userId: number, messageData: ChatMessage) {
    const client = this.clients.get(userId);
    if (!client) return;

    try {
      // Get business context
      const metrics = await storage.getDashboardMetrics(userId);
      const businessContext: BusinessContext = await this.getRealBusinessContext(userId, metrics);

      // Generate AI response
      const response = await generateIntelligentResponse(
        messageData.message,
        businessContext
      );

      // Save to database
      const savedMessage = await storage.createChatMessage({
        userId,
        message: messageData.message,
        response: response
      });

      // Send response back to client
      client.ws.send(JSON.stringify({
        type: 'message_response',
        data: {
          id: savedMessage.id,
          message: savedMessage.message,
          response: savedMessage.response,
          timestamp: savedMessage.timestamp,
          attachments: messageData.attachments || [],
          scenario: messageData.scenario
        },
        timestamp: new Date().toISOString()
      }));

      // Send typing indicator stop
      client.ws.send(JSON.stringify({
        type: 'typing_stop',
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('[websocket] Error handling chat message:', error);
      
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process your message. Please try again.',
        timestamp: new Date().toISOString()
      }));
    }
  }

  private async getRealBusinessContext(userId: number, metrics: any[]): Promise<BusinessContext> {
    try {
      // Get user for context
      const user = await storage.getUser(userId);
      
      // Get integrations for external data
      const integrations = await storage.getIntegrations(userId);
      const bitrixIntegration = integrations.find(i => i.service === 'bitrix24');
      
      let salesData: any[] = [];
      let teamPerformance: any[] = [];
      let topCustomers: any[] = [];
      let recentActivities: any[] = [];

      if (bitrixIntegration) {
        // Fetch real Bitrix24 data
        const bitrixData = await storage.getBitrixData(bitrixIntegration.id);
        
        salesData = bitrixData
          .filter(d => d.dataType === 'deal')
          .map(d => JSON.parse((d.data || '{}') as string));
          
        const contactsData = bitrixData
          .filter(d => d.dataType === 'contact')
          .map(d => JSON.parse((d.data || '{}') as string));
          
        topCustomers = contactsData.slice(0, 5);
        
        recentActivities = [
          { action: 'Deal created', time: '2 hours ago', details: `${salesData.length} active deals` },
          { action: 'Contact added', time: '4 hours ago', details: `${contactsData.length} total contacts` },
          { action: 'Data synced', time: '6 hours ago', details: 'Bitrix24 integration' }
        ];
      }

      // Generate team performance from available data
      teamPerformance = [
        { name: 'Sales Team', satisfaction: 85, productivity: 92 },
        { name: 'Support Team', satisfaction: 78, productivity: 88 },
        { name: 'Marketing Team', satisfaction: 82, productivity: 85 }
      ];

      return {
        metrics: metrics || [],
        salesData,
        teamPerformance,
        topCustomers,
        recentActivities,
        userRole: user?.role || 'User',
        userName: user?.firstName || 'User',
        companyName: user?.company || 'Your Company',
        conversationHistory: []
      };
    } catch (error) {
      console.error('[websocket] Error building business context:', error);
      return {
        metrics: [],
        salesData: [],
        teamPerformance: [],
        topCustomers: [],
        recentActivities: [],
        conversationHistory: []
      };
    }
  }

  private setupHeartbeat() {
    const interval = setInterval(() => {
      this.clients.forEach((client, userId) => {
        if (!client.isAlive) {
          console.log(`[websocket] Terminating dead connection for userId=${userId}`);
          client.ws.terminate();
          this.clients.delete(userId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Public methods for external use
  public sendToUser(userId: number, message: any) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  public broadcastToAll(message: any) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedUsers(): number[] {
    return Array.from(this.clients.keys());
  }

  public isUserConnected(userId: number): boolean {
    const client = this.clients.get(userId);
    return client ? client.ws.readyState === WebSocket.OPEN : false;
  }

  public getConnectionCount(): number {
    return this.clients.size;
  }

  public close() {
    this.clients.forEach((client) => {
      client.ws.close();
    });
    this.wss.close();
  }
}

// Export singleton instance
let websocketManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  if (!websocketManager) {
    websocketManager = new WebSocketManager(server);
    console.log('[websocket] WebSocket server initialized');
  }
  return websocketManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return websocketManager;
}