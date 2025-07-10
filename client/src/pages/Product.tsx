import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import OraclioLogo from "@/components/OraclioLogo";
import { 
  ArrowRightIcon, 
  SearchIcon,
  MessageSquareIcon,
  FileTextIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  ClockIcon,
  User,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";

// User interface
interface User {
  id: number;
  email: string;
  username: string;
  companyName?: string;
  role?: string;
  tools?: string[];
  firstName?: string;
  lastName?: string;
  position?: string;
}

export default function Product() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check user authentication status and ensure light mode
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    
    // Ensure this page is always in light mode
    document.documentElement.classList.remove("dark");
  }, []);

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setLocation("/");
  };

  const conversationData = [
    {
      type: "Slack Conversations",
      items: [
        "Acme has had significant interactions with Frasier Automotive, particularly highlighted in a thread where Tony Smith mentioned a strong executive alignment with Frasier Automotive's CTO, Anne Taylor.",
        "Anne Taylor has been involved in deep testing of Acme's applications. They are using it within their operating applications to have teams to use it within sales and support departments."
      ]
    },
    {
      type: "Bing Calls",
      items: [
        "In the most recent call, Frasier Automotive data platform team was excited about using Acme. They discussed various aspects of Acme's roadmap and its integration with Frasier's existing tools. The conversation highlighted ongoing efforts to improve meeting effectiveness and the potential for further collaboration."
      ]
    }
  ];

  const relatedItems = [
    { icon: "📊", label: "Company Knowledge", color: "bg-blue-100 text-blue-800" },
    { icon: "📄", label: "Jira Discussion", color: "bg-purple-100 text-purple-800" },
    { icon: "🔍", label: "Internal Super documents demo", color: "bg-green-100 text-green-800" },
    { icon: "➕", label: "+2 more", color: "bg-gray-100 text-gray-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow-sm">
        <div className="flex items-center">
          <a href="/" className="cursor-pointer">
            <OraclioLogo size="md" />
          </a>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-8">
            <NavigationMenuItem>
              <a href="/product" className="font-medium text-blue-600 text-sm border-b-2 border-blue-600 pb-1">
                Product
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/solutions" className="font-medium text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Solutions
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/pricing" className="font-medium text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Pricing
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/resources" className="font-medium text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Resources
              </a>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm ring-2 ring-blue-200">
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                <DropdownMenuItem 
                  onClick={() => setLocation("/dashboard")}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLocation("/profile")}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 border-gray-200" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 cursor-pointer text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <a href="/sign-in"><span className="font-medium text-gray-600 text-sm">Sign in</span></a>
              <Button className="bg-blue-600 text-slate-50 rounded-[10px]" onClick={() => window.location.href = '/sign-up'}>
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Panel */}
        <div className="w-1/2 px-12 py-16 flex flex-col justify-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Universal Knowledge
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-8">
              Break down<br />
              knowledge<br />
              barriers
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-lg">
              Search, analyze, and act on insights from company data and the web — all in one place.
            </p>
            
            <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold px-8 py-3 rounded-lg text-lg">
              Get a demo
            </Button>
          </div>
        </div>

        {/* Right Panel - AI Interface */}
        <div className="w-1/2 px-8 py-16 flex items-center justify-center relative">
          {/* Floating Icons */}
          <div className="absolute top-16 left-16 w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
            <FileTextIcon className="w-6 h-6 text-white" />
          </div>
          <div className="absolute top-8 right-24 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <UsersIcon className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-32 left-8 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-32 right-8 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <SearchIcon className="w-6 h-6 text-white" />
          </div>
          <div className="absolute bottom-16 right-16 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-8 right-32 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <MessageSquareIcon className="w-4 h-4 text-white" />
          </div>

          {/* Main AI Interface Card */}
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Provide overview of recent conversations with Acme Corp and Frasier Automotive.
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SearchIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Searching company knowledge</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>• Find the most recent Slack conversations mentioning Acme's relationship with Frasier Automotive</div>
                    <div>• Find recent Bing call transcripts related to Acme's collaboration with Frasier Automotive</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Based on the information gathered from Slack conversations and Bing calls, here is an overview of Acme's relationship with Frasier Automotive:
                  </p>
                  
                  {conversationData.map((section, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-blue-600">{index + 1}.</span>
                        {section.type}:
                      </h4>
                      <ul className="space-y-2 ml-6">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-700 leading-relaxed">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {relatedItems.map((item, index) => (
                    <Badge key={index} className={`${item.color} border-0 text-xs`}>
                      <span className="mr-1">{item.icon}</span>
                      {item.label}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>Company Knowledge</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="w-3 h-3" />
                    <span>Jira Discussion</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SearchIcon className="w-3 h-3" />
                    <span>Internal Super documents demo</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Company +"
                    className="border-0 bg-transparent text-sm flex-1"
                  />
                  <Button size="sm" className="bg-blue-600 text-white rounded-md px-3">
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}