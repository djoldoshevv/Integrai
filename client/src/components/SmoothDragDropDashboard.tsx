import { useState, useCallback, useRef } from "react";
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
import { 
  PanelRight,
  GripVertical,
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
  CustomerSegmentationWidget,
  RegionalPerformanceWidget,
  ProductAnalyticsWidget,
} from "@/components/DashboardWidgets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DashboardWidget } from "@shared/schema";

interface SmoothDragDropDashboardProps {
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
  {
    type: "customer_segmentation",
    title: "Customer Segmentation",
    description: "Customer demographics and behavior analysis",
    icon: Users,
    color: "bg-purple-600",
    component: CustomerSegmentationWidget,
  },
  {
    type: "regional_performance",
    title: "Regional Performance",
    description: "Geographic revenue and growth metrics",
    icon: TrendingUp,
    color: "bg-emerald-600",
    component: RegionalPerformanceWidget,
  },
  {
    type: "product_analytics",
    title: "Product Analytics",
    description: "Product usage and satisfaction metrics",
    icon: Activity,
    color: "bg-blue-600",
    component: ProductAnalyticsWidget,
  },
];

interface SortableWidgetProps {
  id: string;
  widget: DashboardWidget;
  onRemove: () => void;
}

function SortableWidget({ id, widget, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id,
    data: { type: 'widget', widget }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = WIDGET_CONFIGS.find(c => c.type === widget.widgetType);
  if (!config) return null;

  const WidgetComponent = config.component;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-grab active:cursor-grabbing z-10 hover:bg-blue-50"
      >
        <GripVertical className="h-4 w-4 text-gray-600" />
      </div>
      
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Widget Content */}
      <WidgetComponent />
    </div>
  );
}

interface DraggableWidgetCardProps {
  config: typeof WIDGET_CONFIGS[0];
  onAdd: () => void;
  isAdding: boolean;
}

function DraggableWidgetCard({ config, onAdd, isAdding }: DraggableWidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `sidebar-${config.type}`,
    data: { type: config.type }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = config.icon;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color} text-white flex-shrink-0`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{config.title}</h4>
            <p className="text-xs text-gray-600 truncate">{config.description}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdding ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <Plus className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableArea({ children, onDrop }: { children: React.ReactNode; onDrop: (widgetType: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'dashboard-drop-zone',
    data: { accepts: ['sidebar-widget'] }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] border-2 border-dashed rounded-lg transition-all duration-200 relative ${
        isOver 
          ? 'border-blue-400 bg-blue-50/50 scale-[1.01]' 
          : 'border-gray-200 bg-gray-50/30'
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 bg-blue-100/40 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-blue-200">
            <p className="text-blue-600 font-medium">Drop widget here to add it</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default function SmoothDragDropDashboard({ userId }: SmoothDragDropDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingWidgets, setAddingWidgets] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: widgetsData, isLoading } = useQuery<WidgetsResponse>({
    queryKey: ["/api/widgets", userId],
    queryFn: () => apiRequest(`/api/widgets?userId=${userId}`),
    enabled: !!userId,
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (widgetType: string) => {
      const config = WIDGET_CONFIGS.find(w => w.type === widgetType);
      if (!config) throw new Error("Widget config not found");
      
      setAddingWidgets(prev => new Set(prev).add(widgetType));
      
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
    onError: () => {
      toast({
        title: "Failed to add widget",
        description: "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      setAddingWidgets(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DashboardWidget> }) => {
      return await apiRequest(`/api/widgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widgets", userId] });
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

  // Optimistic widget creation without debouncing
  const createWidget = useCallback((widgetType: string) => {
    // Prevent duplicate creation
    if (addingWidgets.has(widgetType)) return;
    
    createWidgetMutation.mutate(widgetType);
  }, [addingWidgets, createWidgetMutation]);

  // Batch update positions to reduce API calls
  const batchUpdatePositions = useCallback(async (updates: Array<{ id: number; position: number }>) => {
    try {
      await Promise.all(
        updates.map(update => 
          updateWidgetMutation.mutateAsync({
            id: update.id,
            updates: { position: update.position }
          })
        )
      );
    } catch (error) {
      console.error('Failed to update widget positions:', error);
      toast({
        title: "Failed to update positions",
        description: "Please try reordering again.",
        variant: "destructive",
      });
    }
  }, [updateWidgetMutation, toast]);

  const widgets = widgetsData?.widgets || [];
  const enabledWidgets = widgets.filter(w => w.isEnabled).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const availableWidgets = WIDGET_CONFIGS.filter(
    config => !widgets.some(w => w.widgetType === config.type && w.isEnabled)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping from sidebar to dashboard (expanded drop zones)
    if (active.id.toString().startsWith('sidebar-')) {
      const widgetType = active.data.current?.type;
      if (widgetType && (over.id === 'dashboard-drop-zone' || over.id.toString().match(/^\d+$/))) {
        createWidget(widgetType);
      }
      return;
    }

    // Handle reordering within dashboard - batch position updates
    const activeWidget = enabledWidgets.find(w => w.id.toString() === active.id);
    const overWidget = enabledWidgets.find(w => w.id.toString() === over.id);

    if (activeWidget && overWidget && activeWidget.id !== overWidget.id) {
      const oldIndex = enabledWidgets.indexOf(activeWidget);
      const newIndex = enabledWidgets.indexOf(overWidget);
      
      const reorderedWidgets = arrayMove(enabledWidgets, oldIndex, newIndex);
      
      // Batch update positions to reduce API calls
      const updates = reorderedWidgets
        .map((widget, index) => ({ id: widget.id, position: index }))
        .filter((update, idx) => enabledWidgets[idx]?.position !== update.position);

      if (updates.length > 0) {
        batchUpdatePositions(updates);
      }
    }
  };

  const handleRemoveWidget = (widgetId: number) => {
    deleteWidgetMutation.mutate(widgetId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative mb-8">
        {/* Sidebar Toggle */}
        <Button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <PanelRight className="h-4 w-4 mr-2" />
          {sidebarOpen ? 'Hide' : 'Show'} Widget Panel
        </Button>

        <div className="flex gap-6">
          {/* Main Dashboard Area */}
          <div className="flex-1">
            <DroppableArea onDrop={createWidget}>
              <div className="p-6">
                {enabledWidgets.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No widgets added</h3>
                      <p className="text-gray-600 mb-4">Drag widgets from the panel or drop them here</p>
                      <Button onClick={() => setSidebarOpen(true)} variant="outline" size="lg">
                        <PanelRight className="h-5 w-5 mr-2" />
                        Open Widget Panel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <SortableContext
                    items={enabledWidgets.map(w => w.id.toString())}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {enabledWidgets.map((widget) => (
                        <SortableWidget
                          key={widget.id}
                          id={widget.id.toString()}
                          widget={widget}
                          onRemove={() => handleRemoveWidget(widget.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            </DroppableArea>
          </div>

          {/* Widget Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Available Widgets</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Drag widgets to your dashboard</p>
              </div>
              
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {availableWidgets.length === 0 ? (
                  <div className="text-center py-8">
                    <Badge variant="secondary" className="mb-2">All widgets added</Badge>
                    <p className="text-sm text-gray-600">
                      All available widgets are already on your dashboard
                    </p>
                  </div>
                ) : (
                  availableWidgets.map((config) => (
                    <DraggableWidgetCard
                      key={config.type}
                      config={config}
                      onAdd={() => createWidget(config.type)}
                      isAdding={addingWidgets.has(config.type)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            activeId.startsWith('sidebar-') ? (
              <div className="transform rotate-3 scale-110">
                <Card className="shadow-2xl bg-white border-2 border-blue-400">
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
                <Card className="shadow-2xl bg-white border-2 border-blue-400">
                  <CardContent className="p-6">
                    <div className="w-64 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
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