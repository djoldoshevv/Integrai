import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Plus,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Filter,
  Settings,
  Share2,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import ReportBuilder from "@/components/ReportBuilder";
import ReportExport from "@/components/ReportExport";

interface Report {
  id: number;
  title: string;
  description: string;
  chartType: string;
  dataSource: string;
  dateRange: string;
  frequency: string;
  isEnabled: boolean;
  createdAt: string;
  lastGenerated?: string;
}

export default function Reports() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportingReport, setExportingReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("last_30_days");
  const [selectedDataSource, setSelectedDataSource] = useState("all");
  const { toast } = useToast();

  // Sample reports data
  const reports: Report[] = [
    {
      id: 1,
      title: "Monthly Revenue Report",
      description: "Comprehensive revenue analysis with trends and forecasts",
      chartType: "line",
      dataSource: "financial_metrics",
      dateRange: "last_30_days",
      frequency: "monthly",
      isEnabled: true,
      createdAt: "2025-06-15",
      lastGenerated: "2025-06-18"
    },
    {
      id: 2,
      title: "Team Performance Summary",
      description: "Team productivity metrics and goal achievement rates",
      chartType: "bar",
      dataSource: "team_performance",
      dateRange: "last_7_days",
      frequency: "weekly",
      isEnabled: true,
      createdAt: "2025-06-14",
      lastGenerated: "2025-06-17"
    },
    {
      id: 3,
      title: "Customer Analytics Dashboard",
      description: "Customer acquisition, retention, and satisfaction metrics",
      chartType: "mixed",
      dataSource: "customer_data",
      dateRange: "last_90_days",
      frequency: "monthly",
      isEnabled: false,
      createdAt: "2025-06-10"
    }
  ];

  // Sample chart data
  const revenueData = [
    { month: "Jan", revenue: 45000, target: 50000 },
    { month: "Feb", revenue: 52000, target: 50000 },
    { month: "Mar", revenue: 48000, target: 55000 },
    { month: "Apr", revenue: 61000, target: 55000 },
    { month: "May", revenue: 58000, target: 60000 },
    { month: "Jun", revenue: 67000, target: 60000 }
  ];

  const teamData = [
    { team: "Sales", completed: 85, target: 100 },
    { team: "Marketing", completed: 92, target: 90 },
    { team: "Support", completed: 78, target: 85 },
    { team: "Product", completed: 95, target: 90 }
  ];

  const customerSegmentData = [
    { name: "Enterprise", value: 45, color: "#3B82F6" },
    { name: "SMB", value: 35, color: "#10B981" },
    { name: "Startup", value: 20, color: "#F59E0B" }
  ];

  const growthData = [
    { month: "Jan", revenue: 45000, users: 1200, deals: 15 },
    { month: "Feb", revenue: 52000, users: 1350, deals: 18 },
    { month: "Mar", revenue: 48000, users: 1280, deals: 16 },
    { month: "Apr", revenue: 61000, users: 1480, deals: 22 },
    { month: "May", revenue: 58000, users: 1420, deals: 20 },
    { month: "Jun", revenue: 67000, users: 1650, deals: 25 }
  ];

  const handleExportReport = (format: string, reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setExportingReport(report);
      setShowExportDialog(true);
    }
  };

  const handleScheduleReport = (reportId: number) => {
    toast({
      title: "Report Scheduled",
      description: "This report will be automatically generated and sent to your email."
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your custom report has been generated and is ready for download."
    });
  };

  const handleShareReport = (reportId: number) => {
    toast({
      title: "Report Shared",
      description: "Report sharing link has been copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
              <p className="text-gray-600 dark:text-gray-400">Create custom reports and track business performance</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Advanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h3>
            <Button variant="outline" size="sm" onClick={handleGenerateReport}>
              Generate Custom Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
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
            
            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="financial_metrics">Financial Data</SelectItem>
                  <SelectItem value="team_performance">Team Metrics</SelectItem>
                  <SelectItem value="customer_data">Customer Analytics</SelectItem>
                  <SelectItem value="sales_pipeline">Sales Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="comparison">Comparative Report</SelectItem>
                  <SelectItem value="forecast">Forecast Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generated This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+12% from last month</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connected Sources</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Real-time sync active</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview Section */}
        {selectedReport && (
          <Card className="mb-8 bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">{selectedReport.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">{selectedReport.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf', selectedReport.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('excel', selectedReport.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleScheduleReport(selectedReport.id)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShareReport(selectedReport.id)}>
                    <Users className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {selectedReport.id === 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                      <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : selectedReport.id === 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="team" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Bar dataKey="completed" fill="#3B82F6" />
                      <Bar dataKey="target" fill="#10B981" opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSegmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="users" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {customerSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Your Reports</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map(report => (
                <div 
                  key={report.id}
                  className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{report.title}</h3>
                        <Badge variant={report.isEnabled ? "default" : "secondary"}>
                          {report.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {report.createdAt}</span>
                        {report.lastGenerated && <span>Last generated: {report.lastGenerated}</span>}
                        <span>Source: {report.dataSource.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleExportReport('pdf', report.id);
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleReport(report.id);
                      }}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleShareReport(report.id);
                      }}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Report Builder */}
        {showCreateForm && (
          <ReportBuilder
            onClose={() => setShowCreateForm(false)}
            onSave={(report) => {
              toast({
                title: "Report Created",
                description: "Your advanced report has been created successfully."
              });
              setShowCreateForm(false);
            }}
          />
        )}

        {/* Export Dialog */}
        {showExportDialog && exportingReport && (
          <ReportExport
            reportId={exportingReport.id}
            reportTitle={exportingReport.title}
            onClose={() => {
              setShowExportDialog(false);
              setExportingReport(null);
            }}
          />
        )}
      </div>
    </div>
  );
}