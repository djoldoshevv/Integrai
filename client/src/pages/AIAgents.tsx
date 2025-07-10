import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import OraclioLogo from "@/components/OraclioLogo";
import {
  ArrowRight,
  Bot,
  Search,
  MessageCircle,
  BarChart3,
  Users,
  Zap,
  Shield,
  CheckCircle,
  PlayCircle,
  User,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react";

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

export default function AIAgents() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <OraclioLogo size="lg" />
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
          </div>
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
                <a href="/sign-in" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Sign in
                </a>
                <button className="glean-button text-white h-12 w-32 shadow-lg text-sm font-medium">
                  <span>Get started</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-6">
            <Bot className="w-4 h-4 mr-2" />
            AI Agents
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI agents that work <br />
            <span className="text-blue-600">where you work</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Deploy intelligent AI agents that understand your business context, 
            automate complex workflows, and seamlessly integrate with your existing tools.
          </p>
          
          <div className="flex items-center justify-center gap-6">
            <button className="glean-button text-white h-14 px-8 shadow-lg text-lg font-medium">
              <span className="flex items-center">
                Start with AI Agents
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </button>
            <Button variant="outline" size="lg" className="h-14 px-8">
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Intelligent automation for every workflow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI agents understand your business context and can handle complex tasks 
              across all your connected applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Intelligent Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find information across all your tools instantly with AI-powered search 
                  that understands context and intent.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Smart Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get intelligent answers and recommendations based on your company's 
                  knowledge and best practices.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Workflow Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automate repetitive tasks and complex processes with AI agents 
                  that work 24/7 across your tech stack.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              AI agents for every team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From sales to engineering, our AI agents adapt to your team's unique needs 
              and workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales</h3>
              <p className="text-gray-600 text-sm">
                Automate lead qualification, proposal generation, and follow-ups
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Generate insights and reports from complex data automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600 text-sm">
                Provide instant, accurate responses to customer inquiries
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-sm">
                Monitor and respond to security threats in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why choose Oraclio AI Agents?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enterprise-ready security</h3>
                    <p className="text-gray-600">
                      Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Deep integrations</h3>
                    <p className="text-gray-600">
                      Connect with 100+ tools and platforms your team already uses.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Custom workflows</h3>
                    <p className="text-gray-600">
                      Design AI agents that match your specific business processes and requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">24/7 availability</h3>
                    <p className="text-gray-600">
                      AI agents work around the clock to keep your business running smoothly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Agent Dashboard</h3>
                    <p className="text-blue-100 text-sm">Real-time monitoring and control</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Sales Agent</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="text-xs text-blue-100">
                      Processed 47 leads today
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Support Agent</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="text-xs text-blue-100">
                      Resolved 128 tickets this week
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Analytics Agent</span>
                      <Badge className="bg-yellow-500 text-white">Running</Badge>
                    </div>
                    <div className="text-xs text-blue-100">
                      Generating monthly report
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to deploy AI agents?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of companies already using Oraclio AI Agents to automate 
            their most important workflows.
          </p>
          <div className="flex items-center justify-center gap-6">
            <button className="glean-button text-white h-14 px-8 shadow-lg text-lg font-medium">
              <span className="flex items-center">
                Start free trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 h-14 px-8">
              Book a demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <OraclioLogo size="md" />
            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            © 2025 Oraclio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}