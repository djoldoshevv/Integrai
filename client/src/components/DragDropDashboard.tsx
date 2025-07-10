import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
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

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isInDashboard: boolean;
}

function DraggableWidget({ id, children, isInDashboard }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isInDashboard) {
    // Widget in sidebar - simpler drag handle
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>
    );
  }

  // Widget in dashboard - with remove button
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>
      {children}
    </div>
  );
}

interface WidgetCardProps {
  config: typeof WIDGET_CONFIGS[0];
  isInDashboard?: boolean;
  onRemove?: () => void;
}

function WidgetCard({ config, isInDashboard = false, onRemove, onAdd }: WidgetCardProps & { onAdd?: () => void }) {
  const IconComponent = config.icon;

  if (isInDashboard) {
    // Render the actual widget component
    const WidgetComponent = config.component;
    return (
      <div className="relative group">
        <WidgetComponent />
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md z-10"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>
    );
  }

  // Sidebar preview card
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onAdd}>
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
}

export default function DragDropDashboard({ userId }: DragDropDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

    console.log("Drag end:", { activeId: active.id, overId: over.id });

    // Handle adding new widget from sidebar
    if (active.id.toString().startsWith("sidebar-")) {
      const widgetType = active.id.toString().replace("sidebar-", "");
      console.log("Adding widget:", widgetType);
      createWidgetMutation.mutate(widgetType);
      return;
    }

    // Handle reordering within dashboard
    if (active.id !== over.id) {
      const activeWidget = enabledWidgets.find(w => w.id.toString() === active.id);
      const overWidget = enabledWidgets.find(w => w.id.toString() === over.id);

      if (activeWidget && overWidget) {
        const oldIndex = enabledWidgets.indexOf(activeWidget);
        const newIndex = enabledWidgets.indexOf(overWidget);

        const reorderedWidgets = [...enabledWidgets];
        const [movedWidget] = reorderedWidgets.splice(oldIndex, 1);
        reorderedWidgets.splice(newIndex, 0, movedWidget);

        // Update positions
        reorderedWidgets.forEach((widget, index) => {
          if (widget.position !== index) {
            updateWidgetMutation.mutate({
              id: widget.id,
              updates: { position: index },
            });
          }
        });
      }
    }
  };

  const handleRemoveWidget = (widgetId: number) => {
    deleteWidgetMutation.mutate(widgetId);
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Main Dashboard Area */}
        <div className="min-h-[400px]">
          <SortableContext
            items={enabledWidgets.map(w => w.id.toString())}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[300px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
            >
              {enabledWidgets.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets added</h3>
                    <p className="text-gray-600 mb-4">Click widgets from the sidebar to add them</p>
                    <Button onClick={() => setSidebarOpen(true)} variant="outline">
                      <PanelRight className="h-4 w-4 mr-2" />
                      Open Widget Panel
                    </Button>
                  </div>
                </div>
              ) : (
                enabledWidgets.map((widget) => {
                  const config = WIDGET_CONFIGS.find(c => c.type === widget.widgetType);
                  if (!config) return null;

                  return (
                    <DraggableWidget
                      key={widget.id}
                      id={widget.id.toString()}
                      isInDashboard={true}
                    >
                      <WidgetCard
                        config={config}
                        isInDashboard={true}
                        onRemove={() => handleRemoveWidget(widget.id)}
                      />
                    </DraggableWidget>
                  );
                })
              )}
            </div>
          </SortableContext>
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
                Drag widgets to your dashboard to add them
              </p>
            </div>

            {/* Widget List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <SortableContext
                items={availableWidgets.map(w => `sidebar-${w.type}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {availableWidgets.length === 0 ? (
                    <div className="text-center py-8">
                      <Badge variant="secondary" className="mb-2">All widgets added</Badge>
                      <p className="text-sm text-gray-600">
                        All available widgets are already on your dashboard
                      </p>
                    </div>
                  ) : (
                    availableWidgets.map((config) => (
                      <DraggableWidget
                        key={`sidebar-${config.type}`}
                        id={`sidebar-${config.type}`}
                        isInDashboard={false}
                      >
                        <WidgetCard 
                          config={config} 
                          onAdd={() => createWidgetMutation.mutate(config.type)}
                        />
                      </DraggableWidget>
                    ))
                  )}
                </div>
              </SortableContext>
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
    </DndContext>
  );
}