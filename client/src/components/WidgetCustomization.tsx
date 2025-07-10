import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp, 
  Wrench,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DashboardWidget } from "@shared/schema";

interface WidgetCustomizationProps {
  userId: number;
}

interface WidgetsResponse {
  widgets: DashboardWidget[];
}

const WIDGET_TYPES = [
  {
    type: "financial",
    title: "Financial Metrics",
    description: "Revenue, expenses, and profit tracking",
    icon: DollarSign,
    color: "bg-green-500"
  },
  {
    type: "team_performance",
    title: "Team Performance",
    description: "Employee satisfaction and productivity",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    type: "recent_activities",
    title: "Recent Activities",
    description: "Latest business activities and updates",
    icon: Activity,
    color: "bg-purple-500"
  },
  {
    type: "sales_funnel",
    title: "Sales Funnel",
    description: "Lead conversion and sales pipeline",
    icon: TrendingUp,
    color: "bg-orange-500"
  },
  {
    type: "tool_metrics",
    title: "Tool-specific Metrics",
    description: "Integration data from your business tools",
    icon: Wrench,
    color: "bg-indigo-500"
  }
];

export default function WidgetCustomization({ userId }: WidgetCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: widgetsData, isLoading } = useQuery<WidgetsResponse>({
    queryKey: ["/api/widgets", userId],
    queryFn: () => apiRequest(`/api/widgets?userId=${userId}`),
    enabled: !!userId,
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
      toast({
        title: "Widget updated",
        description: "Your dashboard has been customized successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update widget configuration.",
        variant: "destructive",
      });
    },
  });

  const handleToggleWidget = (widget: DashboardWidget) => {
    updateWidgetMutation.mutate({
      id: widget.id,
      updates: { isEnabled: !widget.isEnabled }
    });
  };

  const handleMoveWidget = (widget: DashboardWidget, direction: "up" | "down") => {
    const widgets = widgetsData?.widgets || [];
    const currentPosition = widget.position ?? 0;
    const newPosition = direction === "up" ? currentPosition - 1 : currentPosition + 1;
    
    updateWidgetMutation.mutate({
      id: widget.id,
      updates: { position: newPosition }
    });
  };

  const widgets = widgetsData?.widgets || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Your Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Toggle widgets on or off and reorder them to create your ideal dashboard layout.
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {WIDGET_TYPES.map((widgetType) => {
                const widget = widgets.find(w => w.widgetType === widgetType.type);
                const IconComponent = widgetType.icon;
                
                return (
                  <Card key={widgetType.type} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${widgetType.color} text-white`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{widgetType.title}</h4>
                            <p className="text-sm text-gray-600">{widgetType.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => widget && handleMoveWidget(widget, "up")}
                              disabled={!widget || updateWidgetMutation.isPending}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => widget && handleMoveWidget(widget, "down")}
                              disabled={!widget || updateWidgetMutation.isPending}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Switch
                            checked={widget?.isEnabled ?? false}
                            onCheckedChange={() => widget && handleToggleWidget(widget)}
                            disabled={updateWidgetMutation.isPending}
                          />
                        </div>
                      </div>
                      
                      {widget?.isEnabled && (
                        <div className="mt-2 flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            Position {(widget.position ?? 0) + 1}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}