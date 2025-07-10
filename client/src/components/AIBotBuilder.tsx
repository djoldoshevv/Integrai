import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bot,
  Send, 
  Brain,
  Zap,
  Clock,
  Database,
  MessageSquare,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface BotWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'webhook' | 'manual';
    config: any;
  };
  steps: BotWorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
}

interface BotWorkflowStep {
  id: string;
  type: 'fetch_data' | 'process_data' | 'send_notification' | 'conditional';
  config: any;
  nextSteps?: string[];
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  workflow?: BotWorkflow;
  suggestions?: string[];
}

interface AIBotBuilderProps {
  userId: number;
}

const BOT_TEMPLATES = [
  {
    id: 'daily_sales_report',
    name: 'Daily Sales Report',
    description: 'Send daily sales metrics to Telegram every morning',
    icon: BarChart3,
    trigger: { type: 'schedule', config: { time: '09:00', frequency: 'daily' } },
    useCase: 'Get daily sales updates automatically sent to your team'
  },
  {
    id: 'lead_notification',
    name: 'New Lead Alert',
    description: 'Notify when new leads are added to CRM',
    icon: Zap,
    trigger: { type: 'webhook', config: { source: 'bitrix24' } },
    useCase: 'Never miss a new potential customer'
  },
  {
    id: 'weekly_kpi',
    name: 'Weekly KPI Summary',
    description: 'Compile and send weekly performance metrics',
    icon: Calendar,
    trigger: { type: 'schedule', config: { time: '09:00', frequency: 'weekly' } },
    useCase: 'Track weekly performance trends automatically'
  },
  {
    id: 'task_reminder',
    name: 'Task Reminder Bot',
    description: 'Send reminders for overdue tasks',
    icon: Clock,
    trigger: { type: 'schedule', config: { time: '10:00', frequency: 'daily' } },
    useCase: 'Keep your team on track with important deadlines'
  }
];

export default function AIBotBuilder({ userId }: AIBotBuilderProps) {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedBot, setSelectedBot] = useState<BotWorkflow | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simulated chat messages for demonstration
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hi! I can help you create AI bots that automate your business processes. What would you like your bot to do?',
      type: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Create a daily sales report bot',
        'Set up lead notifications',
        'Generate weekly KPI summaries',
        'Send task reminders'
      ]
    }
  ]);

  const { data: botsResponse, isLoading } = useQuery({
    queryKey: ['/api/ai-bots', userId],
    queryFn: () => apiRequest(`/api/ai-bots?userId=${userId}`)
  });

  const existingBots = Array.isArray(botsResponse) ? botsResponse : [];

  const createBotMutation = useMutation({
    mutationFn: async (botData: any) => {
      return apiRequest('/api/ai-bots', {
        method: 'POST',
        body: JSON.stringify({ ...botData, userId })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-bots', userId] });
      toast({
        title: "Bot created successfully",
        description: "Your AI bot has been created and is ready to use"
      });
      
      // Add success message to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Great! I've created your bot "${data.bot.name}". You can now activate it and start automating your workflow.`,
        type: 'ai',
        timestamp: new Date(),
        workflow: data.bot
      }]);
    }
  });

  const processBotRequestMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/ai-bots/process-nlp', {
        method: 'POST',
        body: JSON.stringify({ message, userId })
      });
    },
    onSuccess: (data) => {
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.explanation,
        type: 'ai',
        timestamp: new Date(),
        workflow: data.workflow,
        suggestions: data.suggestions
      }]);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Process with NLP
    processBotRequestMutation.mutate(message);
    setMessage('');
  };

  const handleCreateBotFromWorkflow = (workflow: BotWorkflow) => {
    createBotMutation.mutate({
      name: workflow.name,
      description: workflow.description,
      systemPrompt: `You are a ${workflow.name}. ${workflow.description}`,
      triggers: workflow.trigger,
      actions: workflow.steps,
      isActive: false
    });
  };

  const handleUseTemplate = (template: any) => {
    const promptMessage = `Create a ${template.name.toLowerCase()} that ${template.description.toLowerCase()}`;
    setMessage(promptMessage);
    setShowTemplates(false);
    
    // Auto-process the template
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const renderWorkflowVisual = (workflow: BotWorkflow) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-3">
        <h4 className="font-semibold text-sm mb-3 flex items-center">
          <Bot className="h-4 w-4 mr-2 text-blue-600" />
          Bot Workflow: {workflow.name}
        </h4>
        <div className="space-y-3">
          {/* Trigger */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Trigger: {workflow.trigger.type}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {JSON.stringify(workflow.trigger.config)}
              </p>
            </div>
          </div>

          {/* Steps */}
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-gray-400 ml-4" />
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                {step.type === 'fetch_data' && <Database className="h-4 w-4 text-white" />}
                {step.type === 'process_data' && <Brain className="h-4 w-4 text-white" />}
                {step.type === 'send_notification' && <MessageSquare className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {step.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {step.config.source || step.config.target || 'Processing step'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleCreateBotFromWorkflow(workflow)}
            disabled={createBotMutation.isPending}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create This Bot
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-3 w-3 mr-1" />
            Modify
          </Button>
        </div>
      </div>
    );
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Bot Builder</h2>
          <p className="text-gray-600 dark:text-gray-400">Create intelligent bots using natural language</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bot Templates</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {BOT_TEMPLATES.map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <template.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {template.description}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {template.useCase}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat">AI Chat Builder</TabsTrigger>
          <TabsTrigger value="bots">My Bots ({existingBots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Bot Creation Assistant
                <Badge variant="outline" className="ml-2">Natural Language</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea ref={chatScrollRef} className="flex-1 p-6">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {msg.type === 'user' ? (
                        <div className="flex justify-end">
                          <div className="flex items-start gap-3 max-w-[80%]">
                            <div className="px-4 py-3 rounded-2xl bg-blue-600 text-white">
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">U</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-3 max-w-[90%]">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-purple-600 text-white">
                                <Brain className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              
                              {msg.workflow && renderWorkflowVisual(msg.workflow)}
                              
                              {msg.suggestions && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {msg.suggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setMessage(suggestion)}
                                      className="text-xs"
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {processBotRequestMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-600 text-white">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Creating your bot...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the bot you want to create... (e.g., 'Create a bot that sends daily sales reports to Telegram')"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || processBotRequestMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try: "Create a bot that counts leads from Bitrix24 and sends me a report every morning"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : existingBots.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bots created yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start by describing what you want your bot to do in the AI Chat Builder
                </p>
                <Button onClick={() => setActiveTab('chat')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingBots.map((bot: any) => (
                <Card key={bot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-sm">{bot.name}</CardTitle>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {bot.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                        {bot.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      Created {new Date(bot.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        {bot.isActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {bot.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}