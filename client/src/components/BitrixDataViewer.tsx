import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Users,
  Building,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  Database
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Integration, BitrixData } from "@shared/schema";

interface BitrixDataViewerProps {
  userId: number;
}

interface IntegrationsResponse {
  integrations: Integration[];
}

interface BitrixDataResponse {
  data: BitrixData[];
}

// Deal card component
function DealCard({ deal }: { deal: any }) {
  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount || "0");
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB'
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const getStageColor = (stageId: string) => {
    const stages: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-800',
      'PREPARATION': 'bg-yellow-100 text-yellow-800',
      'PREPAYMENT_INVOICE': 'bg-orange-100 text-orange-800',
      'EXECUTING': 'bg-purple-100 text-purple-800',
      'FINAL_INVOICE': 'bg-green-100 text-green-800',
      'WON': 'bg-green-100 text-green-800',
      'LOSE': 'bg-red-100 text-red-800'
    };
    return stages[stageId] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{deal.TITLE}</CardTitle>
            <Badge className={getStageColor(deal.STAGE_ID)}>
              {deal.STAGE_ID}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(deal.OPPORTUNITY, deal.CURRENCY_ID)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="h-4 w-4" />
          Создано: {formatDate(deal.DATE_CREATE)}
        </div>
        
        {deal.DATE_MODIFY && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <RefreshCw className="h-4 w-4" />
            Изменено: {formatDate(deal.DATE_MODIFY)}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FileText className="h-4 w-4" />
          ID: {deal.ID}
        </div>
      </CardContent>
    </Card>
  );
}

// Statistics component
function DataStatistics({ data }: { data: BitrixData[] }) {
  const deals = data.filter(item => item.dataType === 'deals');
  
  const totalValue = deals.reduce((sum, item) => {
    const data = item.data as any;
    const opportunity = parseFloat(data?.OPPORTUNITY || "0");
    return sum + opportunity;
  }, 0);

  const wonDeals = deals.filter(item => {
    const data = item.data as any;
    return data?.STAGE_ID === 'WON';
  });
  const wonValue = wonDeals.reduce((sum, item) => {
    const data = item.data as any;
    const opportunity = parseFloat(data?.OPPORTUNITY || "0");
    return sum + opportunity;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего сделок</p>
              <p className="text-2xl font-bold">{deals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Выигранных</p>
              <p className="text-2xl font-bold">{wonDeals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Общая сумма</p>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB'
                }).format(totalValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Выигранная сумма</p>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB'
                }).format(wonValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BitrixDataViewer({ userId }: BitrixDataViewerProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<number | null>(null);

  const { data: integrationsData, isLoading: integrationsLoading } = useQuery<IntegrationsResponse>({
    queryKey: ["/api/integrations", userId],
    queryFn: () => apiRequest(`/api/integrations?userId=${userId}`),
    enabled: !!userId,
  });

  const { data: bitrixData, isLoading: dataLoading } = useQuery<BitrixDataResponse>({
    queryKey: ["/api/bitrix-data", selectedIntegration],
    queryFn: () => apiRequest(`/api/bitrix-data/${selectedIntegration}`),
    enabled: !!selectedIntegration,
  });

  const integrations = integrationsData?.integrations.filter(i => i.service === 'bitrix24' && i.isActive) || [];
  const data = bitrixData?.data || [];

  // Автоматически выбираем первую интеграцию
  if (integrations.length > 0 && !selectedIntegration) {
    setSelectedIntegration(integrations[0].id);
  }

  if (integrationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Данные Битрикс24</h2>
        </div>
        
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Нет подключенных интеграций Битрикс24
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Подключите Битрикс24 в разделе "Интеграции" и синхронизируйте данные для их отображения здесь.
            </p>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Перейти к интеграциям
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deals = data.filter(item => item.dataType === 'deals');
  const contacts = data.filter(item => item.dataType === 'contacts');
  const companies = data.filter(item => item.dataType === 'companies');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bitrix24 Data</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Imported data from your CRM
          </p>
        </div>
        
        {integrations.length > 1 && (
          <div className="flex gap-2">
            {integrations.map((integration) => (
              <Button
                key={integration.id}
                variant={selectedIntegration === integration.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIntegration(integration.id)}
              >
                {integration.serviceName}
              </Button>
            ))}
          </div>
        )}
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : data.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Нет синхронизированных данных
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Запустите синхронизацию в разделе "Интеграции" для импорта данных из Битрикс24.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <DataStatistics data={data} />

          <Tabs defaultValue="deals" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Сделки ({deals.length})
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Контакты ({contacts.length})
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Компании ({companies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-4">
              {deals.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Нет синхронизированных сделок</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {deals.map((item) => (
                    <DealCard key={item.id} deal={item.data} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Нет синхронизированных контактов</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {contacts.map((item) => (
                    <Card key={item.id} className="bg-white dark:bg-gray-800">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {item.externalId}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              {companies.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Нет синхронизированных компаний</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {companies.map((item) => (
                    <Card key={item.id} className="bg-white dark:bg-gray-800">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {item.externalId}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}