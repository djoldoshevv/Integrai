import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PanelRight,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  Wrench,
  X,
  Plus
} from "lucide-react";
import {
  FinancialMetricsWidget,
  TeamPerformanceWidget,
  RecentActivitiesWidget,
  SalesFunnelWidget,
  ToolMetricsWidget,
} from "@/components/DashboardWidgets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DashboardWidget } from "@shared/schema";

interface DragDropDashboardProps {
  userId: number;
}

interface WidgetsResponse {
  widgets: DashboardWidget[];
}

const WIDGET_CONFIGS = [
  {
    type: "financial",
    title: "Financial Metrics",
    description: "Revenue, expenses, and profit tracking",
    icon: DollarSign,
    color: "bg-green-500",
    component: FinancialMetricsWidget,
  },
  {
    type: "team_performance", 
    title: "Team Performance",
    description: "Employee satisfaction and productivity",
    icon: Users,
    color: "bg-blue-500",
    component: TeamPerformanceWidget,
  },
  {
    type: "recent_activities",
    title: "Recent Activities", 
    description: "Latest business activities and updates",
    icon: Activity,
    color: "bg-purple-500",
    component: RecentActivitiesWidget,
  },
  {
    type: "sales_funnel",
    title: "Sales Funnel",
    description: "Lead conversion and sales pipeline", 
    icon: TrendingUp,
    color: "bg-orange-500",
    component: SalesFunnelWidget,
  },
  {
    type: "tool_metrics",
    title: "Tool-specific Metrics",
    description: "Integration data from your business tools",
    icon: Wrench,
    color: "bg-indigo-500", 
    component: ToolMetricsWidget,
  },
];

export default function SimpleDragDropDashboard({ userId }: DragDropDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: widgetsData, isLoading } = useQuery<WidgetsResponse>({
    queryKey: ["/api/widgets", userId],
    queryFn: () => apiRequest(`/api/widgets?userId=${userId}`),
    enabled: !!userId,
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (widgetType: string) => {
      const config = WIDGET_CONFIGS.find(w => w.type === widgetType);
      if (!config) throw new Error("Widget config not found");
      
      return await apiRequest("/api/widgets", {
        method: "POST",
        body: JSON.stringify({
          userId,
          widgetType,
          title: config.title,
          isEnabled: true,
          position: widgets.length,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets", userId] });
      toast({
        title: "Widget added",
        description: "Widget has been added to your dashboard.",
      });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/widgets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets", userId] });
      toast({
        title: "Widget removed",
        description: "Widget has been removed from your dashboard.",
      });
    },
  });

  const widgets = widgetsData?.widgets || [];
  const enabledWidgets = widgets.filter(w => w.isEnabled).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const availableWidgets = WIDGET_CONFIGS.filter(
    config => !widgets.some(w => w.widgetType === config.type && w.isEnabled)
  );

  const handleAddWidget = (widgetType: string) => {
    createWidgetMutation.mutate(widgetType);
  };

  const handleRemoveWidget = (widgetId: number) => {
    deleteWidgetMutation.mutate(widgetId);
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, widgetType: string) => {
    setDraggedWidget(widgetType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedWidget) {
      handleAddWidget(draggedWidget);
      setDraggedWidget(null);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const config = WIDGET_CONFIGS.find(c => c.type === widget.widgetType);
    if (!config) return null;

    const WidgetComponent = config.component;
    return (
      <div key={widget.id} className="relative group">
        <WidgetComponent />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveWidget(widget.id)}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md z-10"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Dashboard Area */}
      <div 
        className="min-h-[400px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px] p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          {enabledWidgets.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets added</h3>
                <p className="text-gray-600 mb-4">Click or drag widgets from the sidebar to add them</p>
                <Button onClick={() => setSidebarOpen(true)} variant="outline">
                  <PanelRight className="h-4 w-4 mr-2" />
                  Open Widget Panel
                </Button>
              </div>
            </div>
          ) : (
            enabledWidgets.map(renderWidget)
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed right-6 top-24 z-50 shadow-lg"
        variant="outline"
      >
        <PanelRight className="h-4 w-4" />
      </Button>

      {/* Widget Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Widgets</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Click or drag widgets to your dashboard to add them
            </p>
          </div>

          {/* Widget List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {availableWidgets.length === 0 ? (
                <div className="text-center py-8">
                  <Badge variant="secondary" className="mb-2">All widgets added</Badge>
                  <p className="text-sm text-gray-600">
                    All available widgets are already on your dashboard
                  </p>
                </div>
              ) : (
                availableWidgets.map((config) => {
                  const IconComponent = config.icon;
                  return (
                    <Card 
                      key={config.type}
                      className="cursor-pointer hover:shadow-md transition-shadow" 
                      onClick={() => handleAddWidget(config.type)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, config.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.color} text-white`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{config.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{config.description}</p>
                          </div>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}