import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import OraclioLogo from "@/components/OraclioLogo";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { 
  SearchIcon,
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  TrendingUpIcon,
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
import onboardingImage from "@assets/Снимок экрана 2025-06-15 в 2.31.42 AM_1749933105864.png";
import directoryImage from "@assets/Снимок экрана 2025-06-15 в 2.33.54 AM_1749933240046.png";

export default function AllTeams() {
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

  const teamUseCases = [
    {
      title: "Onboard new hires quickly",
      description: "Search for answers to questions and browse",
      image: "/placeholder-onboarding.png",
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: <UsersIcon className="w-8 h-8" />
    },
    {
      title: "Understand who's who",
      description: "Quickly look up people at your company to",
      image: "/placeholder-directory.png", 
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      icon: <SearchIcon className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white">
        <div className="flex items-center">
          <a href="/" className="cursor-pointer">
            <OraclioLogo size="md" />
          </a>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-8">
            <NavigationMenuItem>
              <a href="/product" className="font-medium text-gray-600 text-sm hover:text-blue-600 transition-colors">
                Product
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/solutions" className="font-medium text-blue-600 text-sm border-b-2 border-blue-600 pb-1">
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
                Get a demo
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-400 py-24 px-8 relative overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-green-300 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-blue-300 to-transparent opacity-40"></div>
          <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 bg-gradient-to-tl from-purple-300 to-transparent opacity-30"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-white text-5xl md:text-6xl leading-tight mb-8">
            Oraclio makes work better<br />
            for everyone.
          </h1>
          <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg">
            Get a demo
          </Button>
        </div>
      </section>

      {/* How Teams Use Section */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-gray-900 text-4xl mb-16">
            How teams use Oraclio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {teamUseCases.map((useCase, index) => (
              <Card key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  {/* Image/Visual Section */}
                  <div className={`${useCase.color} h-64 p-8 relative flex items-center justify-center`}>
                    {index === 0 && (
                      <img 
                        src={onboardingImage} 
                        alt="New Hire Onboarding interface showing Employee handbook, Benefits Portal, and Payroll" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    )}
                    {index === 1 && (
                      <img 
                        src={directoryImage} 
                        alt="Org chart showing team member profiles with recent activity and collaboration history" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <h3 className="font-bold text-gray-900 text-xl mb-3">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-gray-900 text-4xl mb-8">
            Ready to transform how your team works?
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using Oraclio to break down knowledge barriers and work more efficiently.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-medium">
              Get a demo
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-medium">
              Learn more
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}