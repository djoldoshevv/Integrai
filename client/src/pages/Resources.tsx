import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import OraclioLogo from "@/components/OraclioLogo";
import {
  ArrowRight,
  FileText,
  BookOpen,
  Code,
  Users,
  MessageCircle,
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

export default function Resources() {
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

  const resources = [
    {
      title: "Documentation",
      description: "Comprehensive guides and API documentation",
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      items: ["Getting Started Guide", "API Reference", "Integration Docs"],
    },
    {
      title: "Learning Center",
      description: "Tutorials and best practices for business intelligence",
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      items: ["Video Tutorials", "Best Practices", "Case Studies"],
    },
    {
      title: "Developer Tools",
      description: "SDKs, libraries, and development resources",
      icon: <Code className="w-8 h-8 text-purple-600" />,
      items: ["JavaScript SDK", "Python Library", "REST API"],
    },
    {
      title: "Community",
      description: "Connect with other Oraclio users and experts",
      icon: <Users className="w-8 h-8 text-orange-600" />,
      items: ["User Forum", "Slack Community", "User Groups"],
    },
    {
      title: "Support",
      description: "Get help when you need it most",
      icon: <MessageCircle className="w-8 h-8 text-red-600" />,
      items: ["Help Center", "Contact Support", "Live Chat"],
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <a href="/" className="cursor-pointer">
              <OraclioLogo size="lg" />
            </a>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex gap-8">
                <NavigationMenuItem>
                  <a href="/product" className="font-medium text-gray-600 text-sm hover:text-blue-600 transition-colors">
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
                  <a href="/resources" className="font-medium text-blue-600 text-sm border-b-2 border-blue-600 pb-1">
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Resources & Support
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to succeed with Oraclio. From documentation to community support, 
            we're here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {resource.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {resource.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {resource.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {resource.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}