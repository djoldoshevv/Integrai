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

interface OptimizedDragDropDashboardProps {
  userId: number;
}

interface WidgetsResponse {
  widgets: DashboardWidget[];
}

const WIDGET_CONFIGS = [
  {
    type: "financial_metrics",
    title: "Financial Metrics",
    description: "Revenue, expenses, and profit tracking",
    icon: DollarSign,
    color: "bg-green-600",
    component: FinancialMetricsWidget,
  },
  {
    type: "team_performance",
    title: "Team Performance",
    description: "Team efficiency and productivity metrics",
    icon: Users,
    color: "bg-blue-600",
    component: TeamPerformanceWidget,
  },
  {
    type: "recent_activities",
    title: "Recent Activities",
    description: "Latest business activities and updates",
    icon: Activity,
    color: "bg-purple-600",
    component: RecentActivitiesWidget,
  },
  {
    type: "sales_funnel",
    title: "Sales Funnel",
    description: "Sales pipeline and conversion rates",
    icon: TrendingUp,
    color: "bg-orange-600",
    component: SalesFunnelWidget,
  },
  {
    type: "tool_metrics",
    title: "Tool Metrics",
    description: "Integration performance and usage",
    icon: Wrench,
    color: "bg-gray-600",
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

// Sortable Widget Component with proper drop zone handling
interface SortableWidgetProps {
  id: string;
  widget: DashboardWidget;
  onRemove: () => void;
  index: number;
}

function SortableWidget({ id, widget, onRemove, index }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: { 
      type: 'widget', 
      widget,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const config = WIDGET_CONFIGS.find(c => c.type === widget.widgetType);
  if (!config) return null;

  const WidgetComponent = config.component;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group transform-gpu"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-grab active:cursor-grabbing z-20 hover:bg-blue-50 border border-gray-200"
      >
        <GripVertical className="h-4 w-4 text-gray-600" />
      </div>
      
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg z-20 hover:bg-red-50 hover:text-red-600 border border-gray-200"
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Widget Content */}
      <div className="pointer-events-auto">
        <WidgetComponent />
      </div>
    </div>
  );
}

// Draggable Widget Card for Sidebar
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
    data: { type: config.type, source: 'sidebar' }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg border-2 ${
        isDragging ? 'border-blue-400 shadow-xl' : 'border-gray-200 hover:border-blue-300'
      } ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white`}>
            <config.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">{config.title}</h3>
            <p className="text-xs text-gray-500 truncate">{config.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={isAdding}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Drop Zone Component
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
          ? 'border-blue-400 bg-blue-50/50 shadow-inner' 
          : 'border-gray-200 bg-gray-50/30'
      }`}
    >
      {isOver && (
        <div className="absolute inset-4 bg-gradient-to-br from-blue-100/70 to-blue-200/40 rounded-lg flex items-center justify-center z-10 pointer-events-none border-2 border-dashed border-blue-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-8 py-4 shadow-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <p className="text-blue-700 font-medium">Drop widget here to add it to your dashboard</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default function OptimizedDragDropDashboard({ userId }: OptimizedDragDropDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: widgetsData, isLoading } = useQuery<WidgetsResponse>({
    queryKey: ["/api/widgets", userId],
    queryFn: () => apiRequest(`/api/widgets?userId=${userId}`),
    enabled: !!userId,
  });

  // Update local widgets when data changes
  useEffect(() => {
    if (widgetsData?.widgets) {
      setLocalWidgets(widgetsData.widgets.filter((w: DashboardWidget) => w.isEnabled).sort((a: DashboardWidget, b: DashboardWidget) => (a.position ?? 0) - (b.position ?? 0)));
    }
  }, [widgetsData]);

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
          position: localWidgets.length,
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

  const updateWidgetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DashboardWidget> }) => {
      return await apiRequest(`/api/widgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update with proper typing
      if (typeof updates.position === 'number') {
        setLocalWidgets(prev => 
          prev.map(w => w.id === id ? { ...w, position: updates.position as number } : w)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        );
      }
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

  const widgets = widgetsData?.widgets || [];
  const enabledWidgets = useMemo(() => 
    localWidgets.length > 0 ? localWidgets : widgets.filter((w: DashboardWidget) => w.isEnabled).sort((a: DashboardWidget, b: DashboardWidget) => (a.position ?? 0) - (b.position ?? 0)),
    [localWidgets, widgets]
  );
  
  const availableWidgets = WIDGET_CONFIGS.filter(
    config => !widgets.some((w: DashboardWidget) => w.widgetType === config.type && w.isEnabled)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping from sidebar to dashboard
    if (active.id.toString().startsWith('sidebar-')) {
      const widgetType = active.data.current?.type;
      if (widgetType && over.id === 'dashboard-main') {
        createWidgetMutation.mutate(widgetType);
      }
      return;
    }

    // Handle reordering within dashboard
    const activeIndex = enabledWidgets.findIndex(w => w.id.toString() === active.id);
    const overIndex = enabledWidgets.findIndex(w => w.id.toString() === over.id);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const reorderedWidgets = arrayMove(enabledWidgets, activeIndex, overIndex);
      
      // Update local state immediately for smooth UI
      setLocalWidgets(reorderedWidgets);
      
      // Batch update positions in background
      const updates = reorderedWidgets.map((widget, index) => ({
        id: widget.id,
        updates: { position: index }
      }));

      updates.forEach(update => {
        updateWidgetMutation.mutate(update);
      });
    }
  }, [enabledWidgets, createWidgetMutation, updateWidgetMutation]);

  const handleRemoveWidget = useCallback((widgetId: number) => {
    deleteWidgetMutation.mutate(widgetId);
  }, [deleteWidgetMutation]);

  const handleAddWidget = useCallback((widgetType: string) => {
    createWidgetMutation.mutate(widgetType);
  }, [createWidgetMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeWidget = activeId ? enabledWidgets.find(w => w.id.toString() === activeId) : null;
  const activeSidebarWidget = activeId?.startsWith('sidebar-') ? 
    WIDGET_CONFIGS.find(w => `sidebar-${w.type}` === activeId) : null;

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
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
        >
          <PanelRight className="h-4 w-4 mr-2" />
          {sidebarOpen ? 'Hide' : 'Show'} Widget Panel
        </Button>

        <div className="flex gap-6">
          {/* Main Dashboard Area */}
          <div className="flex-1">
            <DashboardDropZone isOver={!!activeId?.startsWith('sidebar-') && !!enabledWidgets}>
              <div className="p-6">
                {enabledWidgets.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No widgets added</h3>
                      <p className="text-gray-600 mb-6">Drag widgets from the panel to get started</p>
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
                      {enabledWidgets.map((widget, index) => (
                        <SortableWidget
                          key={widget.id}
                          id={widget.id.toString()}
                          widget={widget}
                          index={index}
                          onRemove={() => handleRemoveWidget(widget.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            </DashboardDropZone>
          </div>

          {/* Widget Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-200">
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
              
              <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
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
                      onAdd={() => handleAddWidget(config.type)}
                      isAdding={createWidgetMutation.isPending}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget ? (
            <div className="transform rotate-2 scale-105 opacity-90">
              <Card className="shadow-2xl bg-white border-2 border-blue-400">
                <CardContent className="p-6">
                  <div className="w-80 h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <GripVertical className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-blue-700 font-medium">Moving widget...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeSidebarWidget ? (
            <div className="transform rotate-3 scale-110">
              <Card className="shadow-2xl bg-white border-2 border-blue-400">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${activeSidebarWidget.color} rounded-lg flex items-center justify-center text-white`}>
                      <activeSidebarWidget.icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-blue-700">Adding {activeSidebarWidget.title}...</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}