import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PanelRight,
  GripVertical,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  Wrench,
  X,
  Plus,
  Settings,
  Save,
  Download,
  Upload,
  Copy,
  Palette,
  Filter,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react";
import {
  FinancialMetricsWidget,
  TeamPerformanceWidget,
  RecentActivitiesWidget,
  SalesFunnelWidget,
  ToolMetricsWidget,
  CustomerSegmentationWidget,
  RegionalPerformanceWidget,
  ProductAnalyticsWidget,
} from "@/components/DashboardWidgets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DashboardWidget } from "@shared/schema";

interface AdvancedDragDropDashboardProps {
  userId: number;
}

interface WidgetConfiguration {
  id: string;
  title: string;
  description: string;
  dataSource: string;
  filters: Record<string, any>;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  colorScheme: string;
  refreshInterval: number;
  showLegend: boolean;
  showValues: boolean;
  customQuery?: string;
}

// Extend DashboardWidget type to include configuration
interface ExtendedDashboardWidget extends DashboardWidget {
  configuration?: WidgetConfiguration;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: Record<string, any>;
  category: 'business' | 'sales' | 'financial' | 'hr' | 'custom';
  isPublic: boolean;
}

const WIDGET_CONFIGS = [
  {
    type: "financial",
    title: "Financial Metrics",
    description: "Revenue, expenses, and profit tracking",
    icon: DollarSign,
    color: "bg-green-500",
    component: FinancialMetricsWidget,
    category: 'financial',
    dataSources: ['quickbooks', 'stripe', 'manual', 'bitrix24']
  },
  {
    type: "team_performance", 
    title: "Team Performance",
    description: "Employee satisfaction and productivity",
    icon: Users,
    color: "bg-blue-500",
    component: TeamPerformanceWidget,
    category: 'hr',
    dataSources: ['slack', 'hr_system', 'manual', 'bitrix24']
  },
  {
    type: "recent_activities",
    title: "Recent Activities", 
    description: "Latest business activities and updates",
    icon: Activity,
    color: "bg-purple-500",
    component: RecentActivitiesWidget,
    category: 'business',
    dataSources: ['crm', 'email', 'calendar', 'bitrix24']
  },
  {
    type: "sales_funnel",
    title: "Sales Funnel",
    description: "Lead conversion and sales pipeline", 
    icon: TrendingUp,
    color: "bg-orange-500",
    component: SalesFunnelWidget,
    category: 'sales',
    dataSources: ['salesforce', 'hubspot', 'pipedrive', 'bitrix24']
  },
  {
    type: "tool_metrics",
    title: "Tool-specific Metrics",
    description: "Integration data from your business tools",
    icon: Wrench,
    color: "bg-indigo-500", 
    component: ToolMetricsWidget,
    category: 'business',
    dataSources: ['bitrix24', 'google_analytics', 'facebook_ads', 'custom']
  },
  {
    type: "customer_segmentation",
    title: "Customer Segmentation",
    description: "Customer analysis and segmentation insights",
    icon: Users,
    color: "bg-pink-500",
    component: CustomerSegmentationWidget,
    category: 'sales',
    dataSources: ['crm', 'analytics', 'bitrix24', 'custom']
  },
  {
    type: "regional_performance",
    title: "Regional Performance",
    description: "Geographic performance analysis",
    icon: BarChart3,
    color: "bg-cyan-500",
    component: RegionalPerformanceWidget,
    category: 'business',
    dataSources: ['google_analytics', 'sales_data', 'bitrix24', 'custom']
  },
  {
    type: "product_analytics",
    title: "Product Analytics",
    description: "Product performance and usage metrics",
    icon: PieChart,
    color: "bg-yellow-500",
    component: ProductAnalyticsWidget,
    category: 'business',
    dataSources: ['mixpanel', 'google_analytics', 'amplitude', 'custom']
  },
];

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'executive_overview',
    name: 'Executive Overview',
    description: 'High-level business metrics for leadership',
    widgets: [],
    layout: {},
    category: 'business',
    isPublic: true
  },
  {
    id: 'sales_dashboard',
    name: 'Sales Performance',
    description: 'Complete sales pipeline and performance tracking',
    widgets: [],
    layout: {},
    category: 'sales',
    isPublic: true
  },
  {
    id: 'financial_dashboard',
    name: 'Financial Overview',
    description: 'Revenue, expenses, and financial health',
    widgets: [],
    layout: {},
    category: 'financial',
    isPublic: true
  },
  {
    id: 'hr_dashboard',
    name: 'HR Analytics',
    description: 'Team performance and employee metrics',
    widgets: [],
    layout: {},
    category: 'hr',
    isPublic: true
  }
];

const COLOR_SCHEMES = [
  { name: 'Blue Ocean', colors: ['#3B82F6', '#1E40AF', '#60A5FA', '#DBEAFE'] },
  { name: 'Green Growth', colors: ['#10B981', '#059669', '#34D399', '#D1FAE5'] },
  { name: 'Purple Power', colors: ['#8B5CF6', '#7C3AED', '#A78BFA', '#EDE9FE'] },
  { name: 'Orange Energy', colors: ['#F59E0B', '#D97706', '#FBBF24', '#FEF3C7'] },
  { name: 'Red Alert', colors: ['#EF4444', '#DC2626', '#F87171', '#FEE2E2'] }
];

export default function AdvancedDragDropDashboard({ userId }: AdvancedDragDropDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfiguration | null>(null);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'business' | 'sales' | 'financial' | 'hr' | 'custom'>('custom');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: widgetsResponse, isLoading } = useQuery({
    queryKey: ['/api/widgets', userId],
    queryFn: () => apiRequest(`/api/widgets?userId=${userId}`)
  });

  const widgets = widgetsResponse?.widgets || [];

  const addWidgetMutation = useMutation({
    mutationFn: (widget: { widgetType: string; position: number; config?: WidgetConfiguration }) =>
      apiRequest('/api/widgets', {
        method: 'POST',
        body: JSON.stringify({
          ...widget,
          userId
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', userId] });
      toast({
        title: "Widget added successfully",
        description: "Your dashboard has been updated"
      });
    }
  });

  const updateWidgetMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & Partial<DashboardWidget>) =>
      apiRequest(`/api/widgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', userId] });
      toast({
        title: "Widget updated successfully"
      });
    }
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: (widgetId: number) =>
      apiRequest(`/api/widgets/${widgetId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/widgets', userId] });
      toast({
        title: "Widget removed successfully"
      });
    }
  });

  const saveDashboardTemplateMutation = useMutation({
    mutationFn: (template: Omit<DashboardTemplate, 'id'>) =>
      apiRequest('/api/dashboard-templates', {
        method: 'POST',
        body: JSON.stringify({
          ...template,
          userId,
          widgets: widgets.map((w: DashboardWidget) => ({
            ...w,
            configuration: widgetConfig
          }))
        })
      }),
    onSuccess: () => {
      toast({
        title: "Dashboard template saved",
        description: `Template "${templateName}" has been saved successfully`
      });
      setShowSaveTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
    }
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id.toString().startsWith('sidebar-')) {
      const widgetType = active.id.toString().replace('sidebar-', '');
      const newPosition = (widgets || []).length;
      
      addWidgetMutation.mutate({ 
        widgetType, 
        position: newPosition,
        config: widgetConfig || undefined
      });
    } else if (over.id === 'dashboard-main') {
      const activeIndex = (widgets || []).findIndex((w: DashboardWidget) => w.id.toString() === active.id);
      const overIndex = (widgets || []).findIndex((w: DashboardWidget) => w.id.toString() === over.id);

      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        const newWidgets = arrayMove(widgets || [], activeIndex, overIndex);
        newWidgets.forEach((widget: any, index: number) => {
          if ((widget.position || 0) !== index) {
            updateWidgetMutation.mutate({ id: widget.id, position: index });
          }
        });
      }
    }
  }, [widgets, addWidgetMutation, updateWidgetMutation, widgetConfig]);

  const handleWidgetConfigure = (widget: DashboardWidget) => {
    setSelectedWidget(widget);
    setWidgetConfig({
      id: widget.id.toString(),
      title: widget.widgetType,
      description: '',
      dataSource: 'bitrix24',
      filters: {},
      chartType: 'bar',
      colorScheme: 'Blue Ocean',
      refreshInterval: 300,
      showLegend: true,
      showValues: true,
      customQuery: ''
    });
    setShowWidgetConfig(true);
  };

  const handleSaveWidgetConfig = () => {
    if (!selectedWidget || !widgetConfig) return;
    
    updateWidgetMutation.mutate({
      id: selectedWidget.id,
      config: widgetConfig
    });
    setShowWidgetConfig(false);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    
    saveDashboardTemplateMutation.mutate({
      name: templateName,
      description: templateDescription,
      widgets: widgets || [],
      layout: {},
      category: templateCategory,
      isPublic: false
    });
  };

  const handleLoadTemplate = (template: DashboardTemplate) => {
    // Implementation would load template widgets and layout
    toast({
      title: "Template loaded",
      description: `Loading "${template.name}" dashboard template`
    });
    setShowTemplates(false);
  };

  const exportDashboard = () => {
    const dashboardData = {
      widgets: widgets,
      layout: {},
      configuration: widgetConfig,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative mb-8">
        {/* Enhanced Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
            >
              <PanelRight className="h-4 w-4 mr-2" />
              {sidebarOpen ? 'Hide' : 'Show'} Widget Panel
            </Button>

            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Dashboard Templates</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="public" className="w-full">
                  <TabsList>
                    <TabsTrigger value="public">Public Templates</TabsTrigger>
                    <TabsTrigger value="my">My Templates</TabsTrigger>
                  </TabsList>
                  <TabsContent value="public">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {DASHBOARD_TEMPLATES.map(template => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{template.name}</h3>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="my">
                    <div className="text-center py-8">
                      <p className="text-gray-500">No saved templates yet</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportDashboard}>
              <Upload className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Dashboard Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="My Dashboard Template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Describe this dashboard template..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select value={templateCategory} onValueChange={(value: any) => setTemplateCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveTemplate} className="w-full">
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Widget Configuration Modal */}
        <Dialog open={showWidgetConfig} onOpenChange={setShowWidgetConfig}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Widget</DialogTitle>
            </DialogHeader>
            {widgetConfig && (
              <Tabs defaultValue="data" className="w-full">
                <TabsList>
                  <TabsTrigger value="data">Data Source</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="data" className="space-y-4">
                  <div>
                    <Label>Data Source</Label>
                    <Select 
                      value={widgetConfig.dataSource} 
                      onValueChange={(value) => setWidgetConfig(prev => prev ? {...prev, dataSource: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitrix24">Bitrix24</SelectItem>
                        <SelectItem value="salesforce">Salesforce</SelectItem>
                        <SelectItem value="hubspot">HubSpot</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Custom Query (Optional)</Label>
                    <Textarea
                      value={widgetConfig.customQuery}
                      onChange={(e) => setWidgetConfig(prev => prev ? {...prev, customQuery: e.target.value} : null)}
                      placeholder="Enter custom SQL or API query..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <Label>Chart Type</Label>
                    <Select 
                      value={widgetConfig.chartType} 
                      onValueChange={(value: any) => setWidgetConfig(prev => prev ? {...prev, chartType: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="donut">Donut Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color Scheme</Label>
                    <Select 
                      value={widgetConfig.colorScheme} 
                      onValueChange={(value) => setWidgetConfig(prev => prev ? {...prev, colorScheme: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_SCHEMES.map(scheme => (
                          <SelectItem key={scheme.name} value={scheme.name}>
                            {scheme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={widgetConfig.showLegend}
                      onCheckedChange={(checked) => setWidgetConfig(prev => prev ? {...prev, showLegend: checked} : null)}
                    />
                    <Label>Show Legend</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={widgetConfig.showValues}
                      onCheckedChange={(checked) => setWidgetConfig(prev => prev ? {...prev, showValues: checked} : null)}
                    />
                    <Label>Show Values</Label>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div>
                    <Label>Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Department Filter</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <Label>Refresh Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={widgetConfig.refreshInterval}
                      onChange={(e) => setWidgetConfig(prev => prev ? {...prev, refreshInterval: parseInt(e.target.value)} : null)}
                      min="60"
                      max="3600"
                    />
                  </div>
                  <div>
                    <Label>Widget Title</Label>
                    <Input
                      value={widgetConfig.title}
                      onChange={(e) => setWidgetConfig(prev => prev ? {...prev, title: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={widgetConfig.description}
                      onChange={(e) => setWidgetConfig(prev => prev ? {...prev, description: e.target.value} : null)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowWidgetConfig(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWidgetConfig}>
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Sidebar with Categories */}
        {sidebarOpen && (
          <Card className="fixed right-6 top-24 w-80 h-[calc(100vh-200px)] z-50 shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Widget Library
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSidebarOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3">
                  {WIDGET_CONFIGS.map((config) => (
                    <DraggableWidget
                      key={config.type}
                      id={`sidebar-${config.type}`}
                      config={config}
                      onAdd={() => addWidgetMutation.mutate({ 
                        widgetType: config.type, 
                        position: widgets.length 
                      })}
                      onConfigure={() => {
                        setWidgetConfig({
                          id: config.type,
                          title: config.title,
                          description: config.description,
                          dataSource: config.dataSources[0],
                          filters: {},
                          chartType: 'bar',
                          colorScheme: 'Blue Ocean',
                          refreshInterval: 300,
                          showLegend: true,
                          showValues: true
                        });
                        setShowWidgetConfig(true);
                      }}
                      isAdding={addWidgetMutation.isPending}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="business" className="space-y-3">
                  {WIDGET_CONFIGS.filter(c => c.category === 'business').map((config) => (
                    <DraggableWidget
                      key={config.type}
                      id={`sidebar-${config.type}`}
                      config={config}
                      onAdd={() => addWidgetMutation.mutate({ 
                        widgetType: config.type, 
                        position: widgets.length 
                      })}
                      onConfigure={() => {
                        setWidgetConfig({
                          id: config.type,
                          title: config.title,
                          description: config.description,
                          dataSource: config.dataSources[0],
                          filters: {},
                          chartType: 'bar',
                          colorScheme: 'Blue Ocean',
                          refreshInterval: 300,
                          showLegend: true,
                          showValues: true
                        });
                        setShowWidgetConfig(true);
                      }}
                      isAdding={addWidgetMutation.isPending}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-3">
                  {WIDGET_CONFIGS.filter(c => ['sales', 'financial', 'hr'].includes(c.category)).map((config) => (
                    <DraggableWidget
                      key={config.type}
                      id={`sidebar-${config.type}`}
                      config={config}
                      onAdd={() => addWidgetMutation.mutate({ 
                        widgetType: config.type, 
                        position: widgets.length 
                      })}
                      onConfigure={() => {
                        setWidgetConfig({
                          id: config.type,
                          title: config.title,
                          description: config.description,
                          dataSource: config.dataSources[0],
                          filters: {},
                          chartType: 'bar',
                          colorScheme: 'Blue Ocean',
                          refreshInterval: 300,
                          showLegend: true,
                          showValues: true
                        });
                        setShowWidgetConfig(true);
                      }}
                      isAdding={addWidgetMutation.isPending}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Dashboard Grid */}
        <DashboardDropZone isOver={!!activeId && activeId.startsWith('sidebar-')}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !widgets || widgets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 to-blue-800 flex items-center justify-center">
                <Plus className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Your dashboard is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Drag widgets from the panel or load a template to start building your personalized dashboard
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setSidebarOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widgets
                </Button>
                <Button variant="outline" onClick={() => setShowTemplates(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </div>
            </div>
          ) : (
            <SortableContext items={(widgets || []).map((w: DashboardWidget) => w.id.toString())} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {(widgets || [])
                  .sort((a: DashboardWidget, b: DashboardWidget) => (a.position || 0) - (b.position || 0))
                  .map((widget: DashboardWidget) => {
                    const config = WIDGET_CONFIGS.find(c => c.type === widget.widgetType);
                    if (!config) return null;

                    return (
                      <SortableWidget
                        key={widget.id}
                        widget={widget}
                        config={config}
                        onDelete={() => deleteWidgetMutation.mutate(widget.id)}
                        onConfigure={() => handleWidgetConfigure(widget)}
                      />
                    );
                  })}
              </div>
            </SortableContext>
          )}
        </DashboardDropZone>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            activeId.startsWith('sidebar-') ? (
              <div className="transform rotate-3 scale-110">
                <Card className="shadow-2xl bg-white dark:bg-gray-800 border-2 border-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg" />
                      <div className="text-sm font-medium">Adding widget...</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="transform rotate-1 scale-105 opacity-90">
                <Card className="shadow-2xl bg-white dark:bg-gray-800 border-2 border-blue-400">
                  <CardContent className="p-6">
                    <div className="w-64 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 to-indigo-900 rounded-lg flex items-center justify-center">
                      <GripVertical className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

// Enhanced Draggable Widget Component
function DraggableWidget({ 
  id, 
  config, 
  onAdd, 
  onConfigure,
  isAdding 
}: { 
  id: string; 
  config: any; 
  onAdd: () => void; 
  onConfigure: () => void;
  isAdding: boolean; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg border-2 ${
        isDragging ? 'border-blue-400 dark:border-blue-500 shadow-xl' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
      } ${isAdding ? 'opacity-50 pointer-events-none' : ''} bg-white dark:bg-gray-800/80`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white`}>
            <config.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{config.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{config.description}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              disabled={isAdding}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Sortable Widget Component
function SortableWidget({ 
  widget, 
  config, 
  onDelete, 
  onConfigure 
}: { 
  widget: DashboardWidget; 
  config: any; 
  onDelete: () => void;
  onConfigure: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const WidgetComponent = config.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${isDragging ? 'opacity-70 scale-105 z-50' : ''}`}
    >
      <Card className="relative group hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <config.icon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              {config.title}
            </CardTitle>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={onConfigure}
                className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="h-3 w-3" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <WidgetComponent userId={widget.userId} />
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Dashboard Drop Zone Component
function DashboardDropZone({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: 'dashboard-main',
    data: { accepts: ['sidebar-widget'] }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[600px] border-2 border-dashed rounded-xl transition-all duration-300 relative ${
        isOver 
          ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 shadow-inner' 
          : 'border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30'
      }`}
    >
      {isOver && (
        <div className="absolute inset-4 bg-gradient-to-br from-blue-100/70 to-blue-200/40 dark:from-blue-900/40 dark:to-blue-800/30 rounded-lg flex items-center justify-center z-10 pointer-events-none border-2 border-dashed border-blue-300">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl px-8 py-4 shadow-xl border border-blue-200 dark:border-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <p className="text-blue-700 dark:text-blue-300 font-medium">Drop widget here to add it to your dashboard</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}