import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Filter,
  Database,
  Cloud,
  MessageSquare,
  FileText,
  Users,
  Building,
  Calendar,
  Mail,
  Globe,
  Briefcase,
  BarChart3,
  Code,
  Settings,
  Lock,
  Zap,
  Smartphone,
  Folder,
  Share2,
  Monitor,
  GitBranch,
  Package,
  Truck,
  ShoppingCart,
  CreditCard,
  Camera,
  Video,
  Music,
  Image,
  Star,
  Bookmark,
  Tag,
  Link
} from "lucide-react";

interface Connector {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
}

const connectors: Connector[] = [
  {
    id: "bitrix24",
    name: "Bitrix24",
    category: "CRM",
    description: "Connect your CRM data, deals, contacts, and pipeline analytics",
    icon: Database,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    isPopular: true,
    features: ["Real-time sync", "Custom fields", "Pipeline tracking"]
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication", 
    description: "Sync conversations, channels, and team communications",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    isPopular: true,
    features: ["Message history", "Channel sync", "File sharing"]
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Storage",
    description: "Access documents, spreadsheets, and files from Google Drive",
    icon: Folder,
    color: "text-green-600",
    bgColor: "bg-green-50",
    isPopular: true,
    features: ["Document sync", "Real-time collaboration", "Version control"]
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    category: "Communication",
    description: "Integrate team chats, meetings, and collaborative workspaces",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    features: ["Team channels", "Meeting recordings", "File collaboration"]
  },
  {
    id: "jira",
    name: "Jira",
    category: "Project Management",
    description: "Connect project tracking, issues, and development workflows",
    icon: Briefcase,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    isNew: true,
    features: ["Issue tracking", "Sprint planning", "Custom workflows"]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Sync customer data, opportunities, and sales analytics",
    icon: BarChart3,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    features: ["Customer records", "Sales pipeline", "Analytics dashboards"]
  },
  {
    id: "notion",
    name: "Notion",
    category: "Documentation",
    description: "Access knowledge base, documents, and team wikis",
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    features: ["Knowledge base", "Team wikis", "Document templates"]
  },
  {
    id: "github",
    name: "GitHub",
    category: "Development",
    description: "Connect repositories, issues, and development workflows",
    icon: GitBranch,
    color: "text-gray-800",
    bgColor: "bg-gray-50",
    features: ["Repository sync", "Issue tracking", "Pull requests"]
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Integrate marketing, sales, and customer service data",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    features: ["Contact management", "Marketing automation", "Sales tracking"]
  },
  {
    id: "trello",
    name: "Trello",
    category: "Project Management",
    description: "Sync boards, cards, and project management workflows",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    features: ["Board sync", "Card tracking", "Team collaboration"]
  },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "Storage",
    description: "Access and sync files from your Dropbox storage",
    icon: Cloud,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    features: ["File sync", "Shared folders", "Version history"]
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Communication",
    description: "Integrate meeting recordings, transcripts, and video content",
    icon: Video,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    features: ["Meeting recordings", "Transcripts", "Calendar integration"]
  }
];

const categories = [
  "All", "CRM", "Communication", "Storage", "Project Management", "Documentation", "Development"
];

export default function Connectors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularConnectors = connectors.filter(c => c.isPopular);
  const newConnectors = connectors.filter(c => c.isNew);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Connect your favorite tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bring all your data together in one place. Oraclio integrates with 100+ popular business applications 
              to give you a unified view of your organization's knowledge.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search connectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit mb-8">
            <TabsTrigger value="all">All Connectors ({connectors.length})</TabsTrigger>
            <TabsTrigger value="popular">Popular ({popularConnectors.length})</TabsTrigger>
            <TabsTrigger value="new">New ({newConnectors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ConnectorGrid connectors={filteredConnectors} viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="popular">
            <ConnectorGrid connectors={popularConnectors} viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="new">
            <ConnectorGrid connectors={newConnectors} viewMode={viewMode} />
          </TabsContent>
        </Tabs>

        {filteredConnectors.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No connectors found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Connectors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">1M+</div>
              <div className="text-gray-600">Data Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't see your tool?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're constantly adding new connectors. Request an integration and we'll prioritize it.
          </p>
          <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl">
            Request Integration
          </Button>
        </div>
      </div>
    </div>
  );
}

// Connector Grid Component
function ConnectorGrid({ connectors, viewMode }: { connectors: Connector[], viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {connectors.map((connector) => (
          <ConnectorListItem key={connector.id} connector={connector} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {connectors.map((connector) => (
        <ConnectorCard key={connector.id} connector={connector} />
      ))}
    </div>
  );
}

// Connector Card Component
function ConnectorCard({ connector }: { connector: Connector }) {
  const IconComponent = connector.icon;

  return (
    <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${connector.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className={`h-6 w-6 ${connector.color}`} />
          </div>
          <div className="flex gap-1">
            {connector.isPopular && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Popular</Badge>
            )}
            {connector.isNew && (
              <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg mb-2">{connector.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{connector.description}</p>

        <div className="mb-4">
          <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
            {connector.category}
          </Badge>
        </div>

        <div className="space-y-1 mb-4">
          {connector.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center text-xs text-gray-500">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
              {feature}
            </div>
          ))}
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}

// Connector List Item Component
function ConnectorListItem({ connector }: { connector: Connector }) {
  const IconComponent = connector.icon;

  return (
    <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 ${connector.bgColor} rounded-xl flex items-center justify-center`}>
              <IconComponent className={`h-6 w-6 ${connector.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-lg">{connector.name}</h3>
                {connector.isPopular && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Popular</Badge>
                )}
                {connector.isNew && (
                  <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{connector.description}</p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                  {connector.category}
                </Badge>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {connector.features.map((feature, index) => (
                    <span key={index} className="flex items-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-1"></div>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}