import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Send, Bot, User, Zap, Database, Target } from 'lucide-react';
import { Link } from 'wouter';
import type { AiBot, BotConversation } from '@shared/schema';

export default function BotChat() {
  const [, params] = useRoute('/bots/:id/chat');
  const botId = parseInt(params?.id || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: botData, isLoading: botLoading } = useQuery({
    queryKey: ['/api/bots', botId],
    queryFn: () => apiRequest(`/api/bots/${botId}`)
  });

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/bots', botId, 'conversations'],
    queryFn: () => apiRequest(`/api/bots/${botId}/conversations`)
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch(`/api/bots/${botId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, userId: 3 })
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', botId, 'conversations'] });
      setMessage('');
      setIsTyping(false);
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' });
      setIsTyping(false);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationsData, isTyping]);

  if (botLoading || conversationsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading chat...</div>
        </div>
      </div>
    );
  }

  const bot: AiBot = botData?.bot;
  const conversations: BotConversation[] = conversationsData?.conversations || [];

  if (!bot) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-400">Bot not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link href="/ai-bots" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Bots
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{bot.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={bot.isActive ? "default" : "secondary"}
                  className={bot.isActive ? "bg-green-600" : ""}
                >
                  {bot.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {bot.schedule}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Bot Configuration */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Purpose</span>
              </div>
              <p className="text-sm text-gray-400">{bot.goal}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Data Sources</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {bot.dataSources.map(source => (
                  <Badge key={source} variant="secondary" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Output Actions</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {bot.outputActions.map(action => (
                  <Badge key={action} variant="outline" className="text-xs">
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">Style</span>
              </div>
              <div className="text-sm text-gray-400">
                <div>{bot.tone}</div>
                <div>{bot.format}</div>
              </div>
            </div>
          </div>

          {/* Example Tasks */}
          {bot.examples && bot.examples.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Example Tasks</h3>
              <div className="space-y-2">
                {bot.examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={() => setMessage(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Chat with {bot.name}</h2>
              <p className="text-sm text-gray-400">AI assistant powered by your business data</p>
            </div>
            <Badge className="bg-blue-600">
              {conversations.length} messages
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Start a conversation</h3>
              <p className="text-gray-500 mb-6">Ask me anything about your business data or try one of the example tasks.</p>
            </div>
          ) : (
            conversations.slice().reverse().map((conversation) => (
              <div key={conversation.id} className="space-y-4">
                {/* User Message */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-lg">
                      {conversation.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {conversation.timestamp ? new Date(conversation.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-700 text-white rounded-lg p-3 max-w-4xl">
                      <div className="whitespace-pre-wrap">{conversation.response}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {bot.name} • {conversation.timestamp ? new Date(conversation.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-600 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-700 text-white rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-700 p-6 bg-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask ${bot.name} about your business...`}
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}