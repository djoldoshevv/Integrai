import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Puzzle,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Integration } from "@shared/schema";

interface IntegrationsManagerProps {
  userId: number;
}

interface IntegrationsResponse {
  integrations: Integration[];
}

// Bitrix24 integration form
function Bitrix24Form({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    serviceName: "",
    apiUrl: "",
    apiKey: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      service: "bitrix24",
      serviceName: formData.serviceName,
      apiUrl: formData.apiUrl.replace(/\/$/, ''), // Remove trailing slash
      apiKey: formData.apiKey,
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="serviceName">Integration Name</Label>
        <Input
          id="serviceName"
          placeholder="e.g. Main Bitrix24"
          value={formData.serviceName}
          onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="apiUrl">Your Bitrix24 URL</Label>
        <Input
          id="apiUrl"
          placeholder="https://your-domain.bitrix24.ru"
          value={formData.apiUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the main URL of your Bitrix24 portal
        </p>
      </div>
      
      <div>
        <Label htmlFor="apiKey">Webhook URL or API Key</Label>
        <Input
          id="apiKey"
          placeholder="https://your-domain.bitrix24.ru/rest/1/abc123/"
          value={formData.apiKey}
          onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Full webhook URL including token
        </p>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Connect Bitrix24
          </>
        )}
      </Button>
    </form>
  );
}

// Integration card component
function IntegrationCard({ 
  integration, 
  onTest, 
  onSync, 
  onDelete, 
  isLoading 
}: { 
  integration: Integration;
  onTest: () => void;
  onSync: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Puzzle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{integration.serviceName}</CardTitle>
            <p className="text-sm text-gray-500">{integration.service}</p>
          </div>
        </div>
        <Badge variant={integration.isActive ? "default" : "secondary"}>
          {integration.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <strong>URL:</strong> {integration.apiUrl}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onTest} 
              disabled={isLoading}
              variant="outline" 
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button 
              disabled={true}
              variant="outline" 
              size="sm"
              className="cursor-not-allowed opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync - in development
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={isLoading}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete integration?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The integration with {integration.serviceName} will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsManager({ userId }: IntegrationsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, any>>({});

  // Fetch integrations
  const { data: integrationsData, isLoading } = useQuery<IntegrationsResponse>({
    queryKey: ["/api/integrations", userId],
    queryFn: () => apiRequest(`/api/integrations?userId=${userId}`),
    enabled: !!userId,
  });

  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/integrations", {
        method: "POST",
        body: JSON.stringify({ ...data, userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", userId] });
      setShowAddForm(false);
      toast({
        title: "Интеграция создана",
        description: "Битрикс24 успешно подключен",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка подключения",
        description: error.message || "Не удалось подключить Битрикс24",
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/integrations/${id}/test`, {
        method: "POST",
      });
    },
    onSuccess: (data, id) => {
      console.log('Full API response:', data);
      console.log('Data structure:', JSON.stringify(data, null, 2));
      
      // Проверяем, где находятся данные
      const actualData = data.data || data;
      console.log('Actual data:', actualData);
      console.log('Deals array:', actualData.deals);
      console.log('Contacts array:', actualData.contacts);
      console.log('Deals length:', actualData.deals?.length);
      console.log('Contacts length:', actualData.contacts?.length);
      
      setTestResults(prev => ({ ...prev, [id]: { success: true, data: actualData } }));
      toast({
        title: "Тест успешен",
        description: "Соединение с Битрикс24 работает",
      });
    },
    onError: (error: any, id) => {
      let errorMessage = error.message || "Неизвестная ошибка";
      
      if (error.message?.includes("401")) {
        errorMessage = "Токен webhook истек или нет прав доступа. Пересоздайте webhook в Битрикс24";
      } else if (error.message?.includes("400")) {
        errorMessage = "Неверный запрос. Проверьте URL webhook";
      } else if (error.message?.includes("404")) {
        errorMessage = "Webhook не найден. Проверьте правильность URL";
      }
      
      setTestResults(prev => ({ ...prev, [id]: { success: false, error: errorMessage } }));
      toast({
        title: "Ошибка подключения",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Sync integration mutation
  const syncIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/integrations/${id}/sync`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Синхронизация завершена",
        description: "Данные из Битрикс24 обновлены",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось синхронизировать данные",
        variant: "destructive",
      });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/integrations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", userId] });
      toast({
        title: "Интеграция удалена",
        description: "Подключение к Битрикс24 отключено",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить интеграцию",
        variant: "destructive",
      });
    },
  });

  const integrations = integrationsData?.integrations || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect Bitrix24 to import your data to Oraclio</p>
        </div>
        
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        )}
      </div>
      {/* Add Integration Form */}
      {showAddForm && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connect Bitrix24</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddForm(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                <strong>How to create a webhook in Bitrix24:</strong><br/>
                1. Go to "Applications" → "Developers" → "Other" → "Incoming webhook"<br/>
                2. Select required access rights (CRM, contacts, deals)<br/>
                3. Copy the complete URL including token<br/>
                4. If you get a 401 error, recreate webhook with new token
              </AlertDescription>
            </Alert>
            
            <Bitrix24Form 
              onSubmit={(data) => createIntegrationMutation.mutate(data)}
              isLoading={createIntegrationMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
      {/* Integrations List */}
      {integrations.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Puzzle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Connected Integrations
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Connect Bitrix24 to automatically import data into Oraclio
            </p>
            <Button onClick={() => setShowAddForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="space-y-4">
              <IntegrationCard
                integration={integration}
                onTest={() => testIntegrationMutation.mutate(integration.id)}
                onSync={() => syncIntegrationMutation.mutate(integration.id)}
                onDelete={() => deleteIntegrationMutation.mutate(integration.id)}
                isLoading={
                  testIntegrationMutation.isPending || 
                  syncIntegrationMutation.isPending || 
                  deleteIntegrationMutation.isPending
                }
              />
              
              {/* Test Results */}
              {testResults[integration.id] && (
                <div className="space-y-4">
                  <Alert className={testResults[integration.id].success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={testResults[integration.id].success ? "text-green-800" : "text-red-800"}>
                      {testResults[integration.id].success 
                        ? "✅ Connection established successfully" 
                        : `❌ ${testResults[integration.id].error}`
                      }
                    </AlertDescription>
                  </Alert>
                  
                  {testResults[integration.id].success && testResults[integration.id].data && (
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-900">Data from Bitrix24</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {(() => {
                                const data = testResults[integration.id].data;
                                console.log('Rendering deals count, data:', data);
                                return data?.deals?.length || data?.summary?.dealsCount || 0;
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">Deals</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {(() => {
                                const data = testResults[integration.id].data;
                                console.log('Rendering contacts count, data:', data);
                                return data?.contacts?.length || data?.summary?.contactsCount || 0;
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">Contacts</div>
                          </div>
                        </div>
                        
                        {/* Deals */}
                        {(() => {
                          const data = testResults[integration.id].data;
                          const deals = data?.deals || [];
                          console.log('Rendering deals section, deals array:', deals);
                          return deals && deals.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-2">Recent Deals:</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {deals.slice(0, 5).map((deal: any) => (
                                  <div key={deal.ID} className="bg-white rounded p-2 border border-blue-100">
                                    <div className="font-medium text-sm">{deal.TITLE || `Deal #${deal.ID}`}</div>
                                    <div className="text-xs text-gray-600">
                                      {deal.OPPORTUNITY && `${deal.OPPORTUNITY} ${deal.CURRENCY_ID || 'RUB'}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                        
                        {/* Contacts */}
                        {testResults[integration.id].data.contacts && testResults[integration.id].data.contacts.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Recent Contacts:</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {testResults[integration.id].data.contacts.slice(0, 5).map((contact: any) => (
                                <div key={contact.ID} className="bg-white rounded p-2 border border-blue-100">
                                  <div className="font-medium text-sm">
                                    {contact.NAME || contact.LAST_NAME 
                                      ? `${contact.NAME || ''} ${contact.LAST_NAME || ''}`.trim()
                                      : `Contact #${contact.ID}`
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {contact.EMAIL && contact.EMAIL[0]?.VALUE}
                                    {contact.PHONE && contact.PHONE[0]?.VALUE && 
                                      (contact.EMAIL ? ` • ${contact.PHONE[0].VALUE}` : contact.PHONE[0].VALUE)
                                    }
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}