import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Calendar,
  Database,
  Target,
  Users,
  DollarSign,
  Settings,
  Eye,
  Download
} from "lucide-react";

interface ReportBuilderProps {
  onClose: () => void;
  onSave: (report: any) => void;
}

interface MetricOption {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
}

export default function ReportBuilder({ onClose, onSave }: ReportBuilderProps) {
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedChartType, setSelectedChartType] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("");
  const [frequency, setFrequency] = useState("");
  const [includeComparison, setIncludeComparison] = useState(false);
  const [includeForecasting, setIncludeForecasting] = useState(false);

  const metricOptions: MetricOption[] = [
    { id: "revenue", name: "Total Revenue", category: "Financial", icon: DollarSign, color: "text-green-600" },
    { id: "expenses", name: "Operating Expenses", category: "Financial", icon: TrendingUp, color: "text-red-600" },
    { id: "profit", name: "Net Profit", category: "Financial", icon: Target, color: "text-blue-600" },
    { id: "sales_leads", name: "Sales Leads", category: "Sales", icon: Users, color: "text-purple-600" },
    { id: "conversion_rate", name: "Conversion Rate", category: "Sales", icon: TrendingUp, color: "text-orange-600" },
    { id: "team_performance", name: "Team Efficiency", category: "HR", icon: Users, color: "text-indigo-600" },
    { id: "customer_satisfaction", name: "Customer Satisfaction", category: "Customer", icon: Target, color: "text-emerald-600" },
    { id: "deal_value", name: "Average Deal Value", category: "Sales", icon: DollarSign, color: "text-cyan-600" }
  ];

  const chartTypes = [
    { value: "line", name: "Line Chart", icon: LineChart, description: "Best for trends over time" },
    { value: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare different categories" },
    { value: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions and percentages" },
    { value: "mixed", name: "Mixed Chart", icon: TrendingUp, description: "Combine multiple chart types" }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSave = () => {
    const report = {
      title: reportTitle,
      description: reportDescription,
      chartType: selectedChartType,
      metrics: selectedMetrics,
      dateRange,
      frequency,
      includeComparison,
      includeForecasting,
      createdAt: new Date().toISOString()
    };
    onSave(report);
  };

  const categorizedMetrics = metricOptions.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MetricOption[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Advanced Report Builder</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Create custom analytics reports with advanced features</p>
            </div>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input 
                  id="title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Enter report title"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Update Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what this report will track and analyze"
                className="dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Chart Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visualization Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chartTypes.map((chart) => {
                const Icon = chart.icon;
                return (
                  <Card 
                    key={chart.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedChartType === chart.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedChartType(chart.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{chart.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{chart.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Metrics Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Metrics</h3>
              <Badge variant="outline">{selectedMetrics.length} selected</Badge>
            </div>
            
            <div className="space-y-6">
              {Object.entries(categorizedMetrics).map(([category, metrics]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {metrics.map((metric) => {
                      const Icon = metric.icon;
                      const isSelected = selectedMetrics.includes(metric.id);
                      return (
                        <div 
                          key={metric.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => handleMetricToggle(metric.id)}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => handleMetricToggle(metric.id)}
                          />
                          <Icon className={`h-5 w-5 ${metric.color}`} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="comparison"
                    checked={includeComparison}
                    onCheckedChange={(checked) => setIncludeComparison(checked === true)}
                  />
                  <Label htmlFor="comparison" className="text-sm font-medium">
                    Include Period Comparison
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="forecasting"
                    checked={includeForecasting}
                    onCheckedChange={(checked) => setIncludeForecasting(checked === true)}
                  />
                  <Label htmlFor="forecasting" className="text-sm font-medium">
                    Enable Trend Forecasting
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {selectedMetrics.length > 0 && selectedChartType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Preview</h3>
              <Card className="bg-gray-50 dark:bg-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {reportTitle || "Untitled Report"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedMetrics.length} metrics • {selectedChartType} chart • {frequency || "No frequency set"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <Download className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Chart preview will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!reportTitle || !selectedChartType || selectedMetrics.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}