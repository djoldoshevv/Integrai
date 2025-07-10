import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Wrench,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

// Custom tooltip component for dark theme compatibility
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-700 dark:text-gray-300" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



// Financial Metrics Widget
export function FinancialMetricsWidget() {
  const financialData = [
    { month: "Jan", revenue: 98000, expenses: 72000 },
    { month: "Feb", revenue: 105000, expenses: 78000 },
    { month: "Mar", revenue: 112000, expenses: 81000 },
    { month: "Apr", revenue: 125000, expenses: 85000 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">$125K</span>
              <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/70">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">$85K</span>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="h-48 [&_.recharts-cartesian-grid_line]:stroke-gray-300 dark:[&_.recharts-cartesian-grid_line]:stroke-gray-600 [&_.recharts-text]:fill-gray-600 dark:[&_.recharts-text]:fill-gray-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Team Performance Widget
export function TeamPerformanceWidget() {
  const performanceData = [
    { name: "Satisfaction", value: 95, color: "#16a34a" },
    { name: "Productivity", value: 88, color: "#3b82f6" },
    { name: "Retention", value: 92, color: "#8b5cf6" },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {performanceData.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.name}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span>Team performance up 8% this quarter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activities Widget
export function RecentActivitiesWidget() {
  const activities = [
    { id: 1, type: "sale", message: "New enterprise deal closed", value: "$45,000", time: "2 hours ago", status: "success" },
    { id: 2, type: "team", message: "3 new team members onboarded", value: "", time: "4 hours ago", status: "info" },
    { id: 3, type: "alert", message: "Customer support tickets spike", value: "+15%", time: "6 hours ago", status: "warning" },
    { id: 4, type: "milestone", message: "Q4 revenue target achieved", value: "100%", time: "1 day ago", status: "success" },
    { id: 5, type: "integration", message: "Slack integration updated", value: "", time: "2 days ago", status: "info" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "sale": return <DollarSign className="h-4 w-4" />;
      case "team": return <Users className="h-4 w-4" />;
      case "alert": return <AlertCircle className="h-4 w-4" />;
      case "milestone": return <Target className="h-4 w-4" />;
      case "integration": return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400";
      case "info": return "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400";
      default: return "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{activity.message}</p>
                  {activity.value && (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{activity.value}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sales Funnel Widget
export function SalesFunnelWidget() {
  const funnelData = [
    { stage: "Leads", value: 1200, color: "#3b82f6" },
    { stage: "Qualified", value: 450, color: "#8b5cf6" },
    { stage: "Proposal", value: 180, color: "#f59e0b" },
    { stage: "Closed", value: 42, color: "#16a34a" },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          Sales Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stage.stage}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.value}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: stage.color,
                    width: `${(stage.value / funnelData[0].value) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-semibold text-green-600 dark:text-green-400">3.5%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Tool-specific Metrics Widget
export function ToolMetricsWidget() {
  const toolData = [
    { name: "Slack Messages", value: 2847, change: "+12%", trend: "up" },
    { name: "Trello Cards", value: 156, change: "+8%", trend: "up" },
    { name: "Excel Reports", value: 23, change: "-2%", trend: "down" },
  ];

  const chartData = [
    { tool: "Slack", usage: 85 },
    { tool: "Trello", usage: 72 },
    { tool: "Excel", usage: 45 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Wrench className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          Tool-specific Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {toolData.map((tool) => (
            <div key={tool.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{tool.value.toLocaleString()}</p>
              </div>
              <Badge 
                className={`${
                  tool.trend === "up" 
                    ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200" 
                    : "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
                }`}
              >
                {tool.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {tool.change}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="tool" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="usage" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Segmentation Widget
export function CustomerSegmentationWidget() {
  const segmentData = [
    { name: "Enterprise", value: 35, color: "#3b82f6", customers: 142 },
    { name: "SMB", value: 45, color: "#10b981", customers: 890 },
    { name: "Startup", value: 20, color: "#f59e0b", customers: 456 },
  ];

  const growthData = [
    { month: "Jan", enterprise: 32, smb: 41, startup: 18 },
    { month: "Feb", enterprise: 34, smb: 43, startup: 19 },
    { month: "Mar", enterprise: 35, smb: 45, startup: 20 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800/90 transition-all duration-300 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Customer Segmentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {segmentData.map((segment) => (
            <div key={segment.name} className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: segment.color }}>
                {segment.value}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{segment.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{segment.customers} customers</div>
            </div>
          ))}
        </div>
        
        <div className="h-48 [&_.recharts-cartesian-grid_line]:stroke-gray-300 dark:[&_.recharts-cartesian-grid_line]:stroke-gray-600 [&_.recharts-text]:fill-gray-600 dark:[&_.recharts-text]:fill-gray-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="enterprise" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="smb" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="startup" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Regional Performance Widget
export function RegionalPerformanceWidget() {
  const regionData = [
    { region: "North America", revenue: 450000, growth: "+15%", customers: 1240 },
    { region: "Europe", revenue: 320000, growth: "+22%", customers: 890 },
    { region: "Asia Pacific", revenue: 180000, growth: "+35%", customers: 560 },
    { region: "Latin America", revenue: 95000, growth: "+12%", customers: 340 },
  ];

  const chartData = [
    { region: "NA", revenue: 450 },
    { region: "EU", revenue: 320 },
    { region: "APAC", revenue: 180 },
    { region: "LATAM", revenue: 95 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          Regional Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {regionData.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{region.region}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{region.customers} customers</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600 dark:text-emerald-400">${(region.revenue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-green-600 dark:text-green-400">{region.growth}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Analytics Widget
export function ProductAnalyticsWidget() {
  const productData = [
    { product: "Analytics Pro", users: 2340, revenue: 180000, satisfaction: 4.8 },
    { product: "Basic Plan", users: 5670, revenue: 85000, satisfaction: 4.5 },
    { product: "Enterprise", users: 890, revenue: 290000, satisfaction: 4.9 },
  ];

  const usageData = [
    { month: "Jan", pro: 2100, basic: 5200, enterprise: 800 },
    { month: "Feb", pro: 2200, basic: 5400, enterprise: 850 },
    { month: "Mar", pro: 2340, basic: 5670, enterprise: 890 },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900/80 shadow-lg border-0 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800/90 transition-all duration-300 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Product Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {productData.map((product) => (
            <div key={product.product} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900 dark:text-gray-100">{product.product}</div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500 dark:text-yellow-400">★</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.satisfaction}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Users</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{product.users.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Revenue</div>
                  <div className="font-semibold text-green-600 dark:text-green-400">${(product.revenue / 1000).toFixed(0)}K</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-40 [&_.recharts-cartesian-grid_line]:stroke-gray-300 dark:[&_.recharts-cartesian-grid_line]:stroke-gray-600 [&_.recharts-text]:fill-gray-600 dark:[&_.recharts-text]:fill-gray-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pro" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="basic" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="enterprise" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}