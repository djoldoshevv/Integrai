import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Paperclip, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Activity,
  Save,
  History,
  FileText,
  Image,
  Mic,
  Settings,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  scenario?: string;
}

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ChatScenario {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  category: 'business' | 'analytics' | 'custom';
}

interface EnhancedAIChatProps {
  userId: number;
  onSendMessage?: (message: string) => void;
}

const CHAT_SCENARIOS: ChatScenario[] = [
  {
    id: 'revenue_analysis',
    name: 'Revenue Analysis',
    description: 'Deep dive into revenue trends and performance',
    prompts: [
      'Show me my revenue trends for the last 6 months',
      'Compare this quarter vs last quarter revenue',
      'What are my top revenue sources?',
      'Identify revenue growth opportunities'
    ],
    category: 'business'
  },
  {
    id: 'sales_pipeline',
    name: 'Sales Pipeline Review',
    description: 'Analyze deals and conversion rates',
    prompts: [
      'Show me my current sales pipeline',
      'What deals are at risk of falling through?',
      'Analyze my conversion rates by stage',
      'Predict next month\'s sales performance'
    ],
    category: 'business'
  },
  {
    id: 'team_performance',
    name: 'Team Performance',
    description: 'Review team metrics and productivity',
    prompts: [
      'How is my team performing this month?',
      'Show me employee satisfaction trends',
      'Identify top performers and areas for improvement',
      'Compare team productivity across departments'
    ],
    category: 'analytics'
  },
  {
    id: 'custom_insights',
    name: 'Custom Business Insights',
    description: 'General business intelligence queries',
    prompts: [
      'What insights can you give me about my business?',
      'Identify any anomalies in my data',
      'Show me key performance indicators',
      'Generate a business summary report'
    ],
    category: 'custom'
  }
];

const CONVERSATION_STARTERS = [
  { icon: MessageCircle, text: "Show me my deals from Bitrix24", color: "text-blue-600" },
  { icon: TrendingUp, text: "How is my revenue trending?", color: "text-green-600" },
  { icon: Users, text: "What insights can you give me?", color: "text-purple-600" },
  { icon: Activity, text: "Analyze my team performance", color: "text-orange-600" }
];

export default function EnhancedAIChat({ userId, onSendMessage }: EnhancedAIChatProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ChatScenario | null>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedConversations, setSavedConversations] = useState<string[]>([]);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket connection for real-time communication
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Initialize WebSocket connection
  useEffect(() => {
    try {
      const wsUrl = `ws://${window.location.host}/ws/chat/${userId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        setSocket(ws);
      };
      
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setSocket(null);
      };
      
      ws.onerror = () => {
        setConnectionStatus('disconnected');
        // Don't show error toast, just use REST fallback silently
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  }, [userId]);

  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', userId],
    queryFn: () => apiRequest(`/api/chat/messages/${userId}`)
  });

  const messages = messagesResponse?.messages || [];

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; attachments?: FileAttachment[]; scenario?: string }) => {
      // Try WebSocket first, fallback to REST
      if (socket && connectionStatus === 'connected') {
        socket.send(JSON.stringify(messageData));
        return new Promise((resolve) => {
          const handleMessage = (event: MessageEvent) => {
            const response = JSON.parse(event.data);
            socket.removeEventListener('message', handleMessage);
            resolve(response);
          };
          socket.addEventListener('message', handleMessage);
        });
      } else {
        return apiRequest('/api/chat', {
          method: 'POST',
          body: JSON.stringify(messageData)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', userId] });
      setMessage('');
      setAttachments([]);
      setSelectedScenario(null);
      if (onSendMessage) {
        onSendMessage(message);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      attachments,
      scenario: selectedScenario?.id
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: reader.result as string
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleScenarioSelect = (scenario: ChatScenario) => {
    setSelectedScenario(scenario);
    setShowScenarios(false);
    if (scenario.prompts.length > 0) {
      setMessage(scenario.prompts[0]);
    }
  };

  const saveConversation = () => {
    const conversationName = `Conversation ${new Date().toLocaleDateString()}`;
    setSavedConversations(prev => [...prev, conversationName]);
    toast({
      title: "Conversation Saved",
      description: `Saved as "${conversationName}"`
    });
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive"
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 rounded-2xl h-[calc(100vh-300px)] backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            AI Business Assistant
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'} 
              className="ml-2 text-xs"
            >
              {connectionStatus === 'connected' ? 'Real-time' : 'Standard'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Dialog open={showScenarios} onOpenChange={setShowScenarios}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Scenarios
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chat Scenarios & Templates</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {CHAT_SCENARIOS.map(scenario => (
                    <Card 
                      key={scenario.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleScenarioSelect(scenario)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{scenario.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {scenario.description}
                        </p>
                        <div className="space-y-1">
                          {scenario.prompts.slice(0, 2).map((prompt, idx) => (
                            <p key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                              • {prompt}
                            </p>
                          ))}
                          {scenario.prompts.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{scenario.prompts.length - 2} more prompts
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conversation History</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  {savedConversations.map((conv, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium">{conv}</p>
                      <p className="text-xs text-gray-500">Click to restore</p>
                    </div>
                  ))}
                  {savedConversations.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No saved conversations yet
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={saveConversation}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {selectedScenario && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              Using scenario: {selectedScenario.name}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col p-0 h-[calc(100%-120px)]">
        <ScrollArea ref={chatScrollRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messagesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading chat history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to your AI Business Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg font-medium">
                  Start a conversation or choose a scenario template
                </p>
                <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                  {CONVERSATION_STARTERS.map((starter, idx) => (
                    <Button 
                      key={idx}
                      variant="outline" 
                      className="text-left justify-start h-auto p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700" 
                      onClick={() => setMessage(starter.text)}
                    >
                      <starter.icon className={`h-4 w-4 mr-3 ${starter.color}`} />
                      "{starter.text}"
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => (
                <div key={msg.id} className="space-y-4">
                  {/* User message */}
                  <div className="flex justify-end mb-4">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-sm">
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs bg-blue-700 rounded p-2">
                                <FileText className="h-3 w-3" />
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                          U
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* AI response */}
                  {msg.response && (
                    <div className="flex justify-start mb-6">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                            <Brain className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {msg.response.split('\n').map((line, lineIndex) => (
                              <p key={lineIndex} className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {sendMessageMutation.isPending && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                      <Brain className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {attachment.type.startsWith('image/') ? (
                    <Image className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="text-xs">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                placeholder="Ask me anything about your business data..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[60px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-[60px]"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                className={`h-[60px] ${isRecording ? 'bg-red-50 border-red-300' : ''}`}
              >
                <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() && attachments.length === 0}
                className="h-[60px] bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}