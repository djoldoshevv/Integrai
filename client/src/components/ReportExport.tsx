import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Table, 
  Image, 
  Calendar,
  Mail,
  Users,
  Clock,
  Check
} from "lucide-react";

interface ReportExportProps {
  reportId: number;
  reportTitle: string;
  onClose: () => void;
}

export default function ReportExport({ reportId, reportTitle, onClose }: ReportExportProps) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [deliveryFrequency, setDeliveryFrequency] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    { value: "pdf", name: "PDF Document", icon: FileText, description: "Professional formatted report" },
    { value: "excel", name: "Excel Workbook", icon: Table, description: "Editable spreadsheet with data" },
    { value: "csv", name: "CSV Data", icon: Table, description: "Raw data for analysis" },
    { value: "png", name: "PNG Image", icon: Image, description: "High-quality chart images" }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Export Completed",
      description: `${reportTitle} has been exported as ${exportFormat.toUpperCase()}${emailRecipients ? ' and sent via email' : ''}.`
    });
    
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Export Report</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">{reportTitle}</p>
            </div>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      exportFormat === format.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setExportFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{format.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Options</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                />
                <Label htmlFor="charts" className="text-sm font-medium">
                  Include Charts and Visualizations
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rawdata"
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(checked === true)}
                />
                <Label htmlFor="rawdata" className="text-sm font-medium">
                  Include Raw Data Tables
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="schedule"
                  checked={scheduleDelivery}
                  onCheckedChange={(checked) => setScheduleDelivery(checked === true)}
                />
                <Label htmlFor="schedule" className="text-sm font-medium">
                  Schedule Automatic Delivery
                </Label>
              </div>
            </div>
          </div>

          {/* Email Recipients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Options</h3>
            <div>
              <Label htmlFor="recipients">Email Recipients (optional)</Label>
              <Input 
                id="recipients"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                className="dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to download only
              </p>
            </div>
            
            {scheduleDelivery && (
              <div>
                <Label htmlFor="frequency">Delivery Frequency</Label>
                <Select value={deliveryFrequency} onValueChange={setDeliveryFrequency}>
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
            )}
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{exportFormat.toUpperCase()}</Badge>
                <span className="text-gray-600 dark:text-gray-400">Format</span>
              </div>
              {includeCharts && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Charts included</span>
                </div>
              )}
              {includeRawData && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Raw data included</span>
                </div>
              )}
              {emailRecipients && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Will be emailed to {emailRecipients.split(',').length} recipient(s)
                  </span>
                </div>
              )}
              {scheduleDelivery && deliveryFrequency && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Scheduled for {deliveryFrequency} delivery
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}