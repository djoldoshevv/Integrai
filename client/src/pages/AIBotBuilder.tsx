import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Bot, Trash2, Edit, MessageCircle, Zap, Settings } from 'lucide-react';
import type { AiBot, InsertAiBot } from '@shared/schema';

const dataSourceOptions = [
  'Bitrix24 CRM',
  'Facebook Ads',
  'WhatsApp Business',
  'Google Sheets',
  'Slack',
  'Notion',
  'Typeform',
  'Excel',
  'Google Analytics',
  'Mailchimp'
];

const outputActionOptions = [
  'Bitrix24 CRM',
  'Slack Notifications',
  'Email Reports',
  'WhatsApp Messages',
  'Dashboard Widgets',
  'Excel Export',
  'Google Sheets',
  'Telegram',
  'SMS Alerts'
];

const botPresets = [
  {
    name: 'Sales Radar',
    goal: 'Track deals and analyze sales pipeline performance',
    dataSources: ['Bitrix24 CRM', 'Facebook Ads'],
    outputActions: ['Slack Notifications', 'Dashboard Widgets'],
    tone: 'Professional and data-driven',
    format: 'Charts and bullet points',
    examples: ['Show weekly deal summary', 'Detect pipeline bottlenecks', 'Compare ad performance']
  },
  {
    name: 'Finance Pro',
    goal: 'Monitor expenses and analyze financial trends',
    dataSources: ['Google Sheets', 'Excel'],
    outputActions: ['Email Reports', 'Dashboard Widgets'],
    tone: 'Formal and precise',
    format: 'Tables and graphs',
    examples: ['Generate monthly expense report', 'Flag budget overruns', 'Track cash flow']
  },
  {
    name: 'HR Pulse',
    goal: 'Analyze team performance and employee satisfaction',
    dataSources: ['Slack', 'Google Sheets'],
    outputActions: ['Email Reports', 'Slack Notifications'],
    tone: 'Friendly and supportive',
    format: 'Summaries with insights',
    examples: ['Team mood analysis', 'Performance trends', 'Engagement metrics']
  },
  {
    name: 'Marketing Growth',
    goal: 'Track marketing campaigns and lead generation',
    dataSources: ['Facebook Ads', 'Google Analytics', 'Mailchimp'],
    outputActions: ['Dashboard Widgets', 'Email Reports'],
    tone: 'Creative and analytical',
    format: 'Visual reports with recommendations',
    examples: ['Campaign ROI analysis', 'Lead quality scoring', 'Channel performance']
  }
];

export default function AIBotBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof botPresets[0] | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    tone: 'Friendly and professional',
    format: 'Bullet points',
    dataSources: [] as string[],
    outputActions: [] as string[],
    schedule: 'On demand',
    examples: [] as string[],
    userId: 3 // Current user ID
  });

  const { data: botsData, isLoading } = useQuery({
    queryKey: ['/api/bots'],
    queryFn: () => apiRequest('/api/bots?userId=3')
  });

  const createBotMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/bots', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({ title: 'Bot created successfully!' });
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to create bot', variant: 'destructive' });
    }
  });

  const deleteBotMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/bots/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({ title: 'Bot deleted successfully!' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      goal: '',
      tone: 'Friendly and professional',
      format: 'Bullet points',
      dataSources: [],
      outputActions: [],
      schedule: 'On demand',
      examples: [],
      userId: 3
    });
    setSelectedPreset(null);
  };

  const handlePresetSelect = (preset: typeof botPresets[0]) => {
    setSelectedPreset(preset);
    setFormData({
      ...formData,
      name: preset.name,
      goal: preset.goal,
      tone: preset.tone,
      format: preset.format,
      dataSources: preset.dataSources,
      outputActions: preset.outputActions,
      examples: preset.examples
    });
  };

  const handleDataSourceToggle = (source: string) => {
    setFormData(prev => ({
      ...prev,
      dataSources: prev.dataSources.includes(source)
        ? prev.dataSources.filter(s => s !== source)
        : [...prev.dataSources, source]
    }));
  };

  const handleOutputActionToggle = (action: string) => {
    setFormData(prev => ({
      ...prev,
      outputActions: prev.outputActions.includes(action)
        ? prev.outputActions.filter(a => a !== action)
        : [...prev.outputActions, action]
    }));
  };

  const handleAddExample = () => {
    const example = prompt('Enter an example task:');
    if (example) {
      setFormData(prev => ({
        ...prev,
        examples: [...prev.examples, example]
      }));
    }
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.goal || formData.dataSources.length === 0 || formData.outputActions.length === 0) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    createBotMutation.mutate(formData);
  };

  const bots = botsData?.bots || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading AI Bots...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8 text-blue-500" />
              AI Bot Builder
            </h1>
            <p className="text-gray-400 mt-2">Create custom AI assistants for your business workflows</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Bot
          </Button>
        </div>

        {isCreating && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create AI Bot</CardTitle>
              <CardDescription>Configure your custom AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Preset Selection */}
                <div className="space-y-4">
                  <Label className="text-white text-lg">Quick Start Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {botPresets.map((preset) => (
                      <Card 
                        key={preset.name}
                        className={`cursor-pointer transition-all hover:border-blue-500 ${
                          selectedPreset?.name === preset.name ? 'border-blue-500 bg-blue-900/20' : 'bg-gray-700 border-gray-600'
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white">{preset.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{preset.goal}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {preset.dataSources.slice(0, 2).map(source => (
                              <Badge key={source} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Bot Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Sales Radar, Finance Pro"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="text-white">Schedule</Label>
                    <Select value={formData.schedule} onValueChange={(value) => setFormData({...formData, schedule: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On demand">On demand</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-white">Purpose & Goal *</Label>
                  <Textarea
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="What should this bot help you with? e.g., Track sales leads from Facebook Ads and WhatsApp, analyze performance, and create leads in Bitrix CRM"
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>

                {/* Style Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Response Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Friendly and professional">Friendly and professional</SelectItem>
                        <SelectItem value="Formal and precise">Formal and precise</SelectItem>
                        <SelectItem value="Casual and conversational">Casual and conversational</SelectItem>
                        <SelectItem value="Technical and detailed">Technical and detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Response Format</Label>
                    <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bullet points">Bullet points</SelectItem>
                        <SelectItem value="Tables and graphs">Tables and graphs</SelectItem>
                        <SelectItem value="Charts and summaries">Charts and summaries</SelectItem>
                        <SelectItem value="Detailed paragraphs">Detailed paragraphs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Data Sources */}
                <div className="space-y-4">
                  <Label className="text-white text-lg">Data Sources (Input) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {dataSourceOptions.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={formData.dataSources.includes(source)}
                          onCheckedChange={() => handleDataSourceToggle(source)}
                        />
                        <Label 
                          htmlFor={`source-${source}`} 
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {source}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output Actions */}
                <div className="space-y-4">
                  <Label className="text-white text-lg">Output Actions *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {outputActionOptions.map((action) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`action-${action}`}
                          checked={formData.outputActions.includes(action)}
                          onCheckedChange={() => handleOutputActionToggle(action)}
                        />
                        <Label 
                          htmlFor={`action-${action}`} 
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {action}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Tasks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg">Example Tasks (Optional)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddExample}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Example
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.examples.map((example, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={example}
                          onChange={(e) => {
                            const newExamples = [...formData.examples];
                            newExamples[index] = e.target.value;
                            setFormData({...formData, examples: newExamples});
                          }}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveExample(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createBotMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createBotMutation.isPending ? 'Creating...' : 'Create Bot'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Bots */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Your AI Bots</h2>
          
          {bots.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <Bot className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No AI Bots Yet</h3>
                <p className="text-gray-500 mb-6">Create your first AI bot to automate business workflows</p>
                <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot: AiBot) => (
                <Card key={bot.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{bot.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={bot.isActive ? "default" : "secondary"}
                              className={bot.isActive ? "bg-green-600" : ""}
                            >
                              {bot.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {bot.schedule}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBotMutation.mutate(bot.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{bot.goal}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">DATA SOURCES</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bot.dataSources.slice(0, 3).map(source => (
                            <Badge key={source} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                          {bot.dataSources.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{bot.dataSources.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">OUTPUT ACTIONS</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bot.outputActions.slice(0, 3).map(action => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                          {bot.outputActions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{bot.outputActions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setLocation(`/bots/${bot.id}/chat`)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          // TODO: Implement bot editing
                          toast({ title: 'Bot editing coming soon!' });
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}