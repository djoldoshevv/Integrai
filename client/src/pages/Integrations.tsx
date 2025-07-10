import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import OraclioLogo from "@/components/OraclioLogo";

interface Integration {
  name: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  popular?: boolean;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  // Popular Integrations
  { name: "Bitrix24", category: "CRM", description: "Connect your Bitrix24 CRM data", logo: "B24", verified: true, popular: true },
  { name: "Google Workspace", category: "Productivity", description: "Gmail, Drive, Calendar, Docs", logo: "GW", verified: true, popular: true },
  { name: "Microsoft 365", category: "Productivity", description: "Outlook, OneDrive, Teams, SharePoint", logo: "M365", verified: true, popular: true },
  { name: "Slack", category: "Communication", description: "Team communication and collaboration", logo: "SLK", verified: true, popular: true },
  { name: "Notion", category: "Knowledge", description: "Notes, wikis, and project management", logo: "NOT", verified: true, popular: true },
  { name: "Salesforce", category: "CRM", description: "Customer relationship management", logo: "SF", verified: true, popular: true },

  // Business Intelligence
  { name: "Tableau", category: "Analytics", description: "Data visualization and analytics", logo: "TAB", verified: true },
  { name: "Power BI", category: "Analytics", description: "Microsoft business analytics", logo: "PBI", verified: true },
  { name: "Looker", category: "Analytics", description: "Google Cloud business intelligence", logo: "LKR", verified: true },
  { name: "Qlik Sense", category: "Analytics", description: "Self-service data visualization", logo: "QLK", verified: true },

  // Communication & Collaboration
  { name: "Microsoft Teams", category: "Communication", description: "Video calls and team collaboration", logo: "MST", verified: true },
  { name: "Zoom", category: "Communication", description: "Video conferencing platform", logo: "ZOM", verified: true },
  { name: "Discord", category: "Communication", description: "Voice and text chat platform", logo: "DSC", verified: true },
  { name: "Mattermost", category: "Communication", description: "Self-hosted team messaging", logo: "MTM", verified: true },

  // Project Management
  { name: "Jira", category: "Project Management", description: "Issue tracking and project management", logo: "JRA", verified: true },
  { name: "Asana", category: "Project Management", description: "Team project and task management", logo: "ASN", verified: true },
  { name: "Trello", category: "Project Management", description: "Visual project management boards", logo: "TRL", verified: true },
  { name: "Monday.com", category: "Project Management", description: "Work operating system", logo: "MON", verified: true },

  // Development Tools
  { name: "GitHub", category: "Development", description: "Code repositories and collaboration", logo: "GH", verified: true },
  { name: "GitLab", category: "Development", description: "DevOps platform", logo: "GL", verified: true },
  { name: "Jenkins", category: "Development", description: "Continuous integration server", logo: "JNK", verified: true },
  { name: "Docker", category: "Development", description: "Container platform", logo: "DCK", verified: true },

  // File Storage
  { name: "Dropbox", category: "Storage", description: "Cloud file storage and sharing", logo: "DBX", verified: true },
  { name: "Box", category: "Storage", description: "Enterprise content management", logo: "BOX", verified: true },
  { name: "OneDrive", category: "Storage", description: "Microsoft cloud storage", logo: "OD", verified: true },
  { name: "Google Drive", category: "Storage", description: "Google cloud storage", logo: "GD", verified: true },

  // Customer Support
  { name: "Zendesk", category: "Support", description: "Customer service platform", logo: "ZD", verified: true },
  { name: "Freshdesk", category: "Support", description: "Customer support software", logo: "FD", verified: true },
  { name: "Intercom", category: "Support", description: "Customer messaging platform", logo: "IC", verified: true },
  { name: "Help Scout", category: "Support", description: "Help desk software", logo: "HS", verified: true },

  // HR & Recruiting
  { name: "BambooHR", category: "HR", description: "Human resources management", logo: "BHR", verified: true },
  { name: "Workday", category: "HR", description: "Enterprise HR and finance", logo: "WD", verified: true },
  { name: "Greenhouse", category: "HR", description: "Recruiting software", logo: "GH", verified: true },
  { name: "Lever", category: "HR", description: "Talent acquisition platform", logo: "LVR", verified: true },

  // Finance & Accounting
  { name: "QuickBooks", category: "Finance", description: "Accounting software", logo: "QB", verified: true },
  { name: "Xero", category: "Finance", description: "Online accounting platform", logo: "XRO", verified: true },
  { name: "Stripe", category: "Finance", description: "Payment processing", logo: "STR", verified: true },
  { name: "PayPal", category: "Finance", description: "Online payments", logo: "PP", verified: true },

  // Coming Soon
  { name: "Figma", category: "Design", description: "Collaborative design tool", logo: "FIG", verified: false, comingSoon: true },
  { name: "Adobe Creative Cloud", category: "Design", description: "Creative software suite", logo: "ACC", verified: false, comingSoon: true },
  { name: "Canva", category: "Design", description: "Graphic design platform", logo: "CNV", verified: false, comingSoon: true },
];

const categories = [
  "All",
  "Popular", 
  "CRM",
  "Productivity",
  "Communication",
  "Analytics",
  "Project Management",
  "Development",
  "Storage",
  "Support",
  "HR",
  "Finance",
  "Design"
];

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
                           integration.category === selectedCategory ||
                           (selectedCategory === "Popular" && integration.popular);
    return matchesSearch && matchesCategory;
  });

  const getLogoComponent = (logo: string, name: string) => {
    if (logo === "B24") {
      return (
        <div className="w-8 h-8 bg-[#2fc7f7] rounded-full flex items-center justify-center shadow-sm">
          <span className="font-bold text-white text-xs">B24</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="font-bold text-blue-600 text-xs">{logo}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <OraclioLogo size="md" />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            </div>
            <Button variant="outline">
              Request Integration
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Connect all your work tools
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect all your existing applications. Experience the power of your company's collective knowledge all in one place.
            </p>
            
            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Available Integrations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getLogoComponent(integration.logo, integration.name)}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {integration.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {integration.verified && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {integration.popular && (
                      <Badge variant="default" className="bg-orange-100 text-orange-800 text-xs">
                        Popular
                      </Badge>
                    )}
                    {integration.comingSoon && (
                      <Badge variant="outline" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {integration.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {integration.comingSoon ? "Coming Soon" : "Available"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Don't see your tool?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're constantly adding new integrations. Request the tools you need most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Request Integration
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}