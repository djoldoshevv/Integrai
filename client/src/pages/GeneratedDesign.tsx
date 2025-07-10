import {
  ArrowRightIcon,
  CheckCircleIcon,
  Check,
  PlayIcon,
  SearchIcon,
  StarIcon,
  FileTextIcon,
  MessageSquareIcon,
  FolderIcon,
  CloudIcon,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { 
  SiSlack, 
  SiJira, 
  SiWhatsapp,
  SiWebflow,
  SiZapier,
  SiCanva,
  SiPinterest,
  SiGrammarly,
  SiRedis,
  SiIntercom,
  SiIntuit,
  SiDuolingo
} from "react-icons/si";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import OraclioLogo from "@/components/OraclioLogo";
import salesAvatarImage from "@assets/684a83d6b1086c2b0a401ccb_Sales_1749909828272.png";
import engineeringAvatarImage from "@assets/6825a43e65ee7921112b2bfd_8d238cdf18837eb5955c58ce9c746567_Home Tab Avatar 1_1749910159691.png";
import customerSupportAvatarImage from "@assets/6825a43e17801b8932ec61c1_cf23a96122c88de01b0a74ccfb11aaa3_Home Tab Avatar 3_1749921581018.png";
import presenterImage from "@assets/photo_5361611880273147610_x_1749933478495.jpg";
import presenter2Image from "@assets/photo_5361611880273147646_x_1749934224259.jpg";
import testimonialAvatarImage from "@assets/66b6123e9b99a7e31d846850_image 191_1749922046843.webp";
import testimonialAvatar2Image from "@assets/665da5dac76e5f084e648dec_Frame 3487_1749922147354.webp";
import customersChoiceAwardImage from "@assets/67614dab588bc95ce4764c10_cc_award_logo_general_2024 1_1749910186015.png";

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

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000 }: { end: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Extract number from string (handles cases like "90%" or "3.2x")
    const numericValue = parseFloat(end.replace(/[^\d.]/g, ''));
    const suffix = end.replace(/[\d.]/g, '');
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = numericValue * easeOut;
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  const formatNumber = (num: number): string => {
    const suffix = end.replace(/[\d.]/g, '');
    if (suffix.includes('%')) {
      return Math.round(num) + '%';
    } else if (suffix.includes('x')) {
      return num.toFixed(1) + 'x';
    }
    return Math.round(num).toString() + suffix;
  };

  return (
    <h3 
      ref={counterRef}
      className="font-bold text-blue-600 text-6xl transform transition-all duration-500 ease-out"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        opacity: isVisible ? 1 : 0
      }}
    >
      {formatNumber(count)}
    </h3>
  );
};

export const GeneratedDesign = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
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
  // Company logos data
  const companyLogos = [
    { name: "LaunchDarkly", color: "text-gray-800", icon: null },
    { name: "Gainsight", color: "text-blue-800", icon: null },
    { name: "Samsara", color: "text-gray-800", icon: null },
    { name: "Citi", color: "text-blue-600", icon: null },
    { name: "Zapier", color: "text-orange-500", icon: <SiZapier className="w-5 h-5" /> },
    { name: "Webflow", color: "text-blue-600", icon: <SiWebflow className="w-5 h-5" /> },
    { name: "Plaid", color: "text-gray-800", icon: null },
    { name: "Ericsson", color: "text-blue-800", icon: null },
    { name: "SeatGeek", color: "text-red-500", icon: null },
    { name: "Duolingo", color: "text-green-500", icon: <SiDuolingo className="w-5 h-5" /> },
    { name: "Grammarly", color: "text-green-600", icon: <SiGrammarly className="w-5 h-5" /> },
    { name: "Databricks", color: "text-blue-600", icon: null },
    { name: "Redis", color: "text-red-500", icon: <SiRedis className="w-5 h-5" /> },
    { name: "Bill", color: "text-orange-500", icon: null },
    { name: "Super.com", color: "text-purple-600", icon: null },
    { name: "Intercom", color: "text-blue-600", icon: <SiIntercom className="w-5 h-5" /> },
    { name: "Intuit", color: "text-blue-500", icon: <SiIntuit className="w-5 h-5" /> },
    { name: "Canva", color: "text-purple-600", icon: <SiCanva className="w-5 h-5" /> },
    { name: "BetterUp", color: "text-gray-800", icon: null },
    { name: "Greenhouse", color: "text-green-500", icon: null },
    { name: "Vanta", color: "text-purple-800", icon: null },
    { name: "Crunchyroll", color: "text-red-500", icon: null },
    { name: "Booking.com", color: "text-blue-800", icon: null },
    { name: "Handshake", color: "text-gray-800", icon: null },
    { name: "Pinterest", color: "text-red-600", icon: <SiPinterest className="w-5 h-5" /> },
    { name: "Zscaler", color: "text-blue-600", icon: null },
    { name: "Abnormal", color: "text-gray-800", icon: null },
    { name: "Rubrik", color: "text-blue-500", icon: null },
    { name: "Zillow", color: "text-blue-700", icon: null },
  ];

  // Customer testimonials data
  const testimonials = [
    {
      company: "Deutsche Telekom",
      text: "We built 'askT' as an employee concierge for all our employees in Germany. AskT combines the world knowledge of a LLM with thousands of knowledge bases — from finance, HR, and legal — all in one tool.",
      author: "Jonathan Abrahamson",
      role: "Chief Product & Digital Officer at Deutsche Telekom",
    },
    {
      company: "Bill",
      text: "Calibrations, email, presentations, content creation are all easier. I've seen stats that say Oraclio saves people 110 hours per year. I know it's saving me a lot more time than that, and you really should be using it too.",
      author: "Steve Januario",
      role: "VP of Technology at BILL",
    },
  ];

  // Features data
  const features = [
    {
      icon: <SearchIcon className="h-6 w-6" />,
      title: "Find information instantly",
      description:
        "SearchIcon across all your connected tools and get instant answers to your questions.",
    },
    {
      icon: <PlayIcon className="h-6 w-6" />,
      title: "Automate repetitive tasks",
      description:
        "Let AI handle your routine tasks so you can focus on what matters most.",
    },
    {
      icon: <ArrowRightIcon className="h-6 w-6" />,
      title: "Collaborate seamlessly",
      description:
        "Share insights and information with your team without switching between apps.",
    },
  ];

  // Stats data
  const stats = [
    {
      value: "93%",
      description: "Oraclio adoption reached 93% in just 2 years.",
    },
    {
      value: "36",
      description: "Oraclio saves 36 hours per employee on onboarding",
    },
    {
      value: "20%",
      description:
        "Oraclio Chat reduces internal support requests by 20% (IT, HR, etc.).",
    },
    {
      value: "6 months",
      description:
        "Companies recover their Oraclio investment in under 6 months.",
    },
  ];

  // Footer links data
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Integrations", "Pricing", "Security"],
    },
    {
      title: "Company",
      links: ["About", "Customers", "Blog", "Careers"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "API", "Community"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "Compliance"],
    },
  ];

  return (
    <div className="bg-gray-50 flex flex-col w-full overflow-x-hidden min-h-screen">
      <div className="w-full overflow-x-hidden">
        {/* Header/Navigation */}
        <header className="flex items-center justify-between px-8 py-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <OraclioLogo size="lg" />
          </div>

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
                <button className="glean-button text-white h-12 w-32 shadow-lg text-sm font-medium" onClick={() => window.location.href = '/sign-up'}>
                  <span>Get started</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row px-8 lg:px-20 py-20 lg:py-24 relative max-w-none mx-auto bg-white section-border-right">
          <div className="lg:w-1/2 space-y-12 flex flex-col justify-center px-4 lg:px-8">
            <h1 className="font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent text-4xl lg:text-5xl xl:text-6xl leading-tight whitespace-nowrap">
              Work AI for all.
            </h1>
            <p className="font-normal text-gray-600 text-2xl lg:text-3xl leading-relaxed max-w-[700px]">
              The Work AI platform connected to all your data. Find, create, and
              automate anything.
            </p>
            <div className="flex items-center gap-6">
              <button className="glean-button text-white h-[80px] lg:h-[90px] w-[160px] lg:w-[180px] shadow-lg text-lg lg:text-xl font-medium">
                <span>Get a demo</span>
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
              >
                <span className="font-medium text-gray-700 text-lg">
                  Watch video
                </span>
                <PlayIcon className="h-6 w-6 ml-2" />
              </button>
            </div>

            <div className="flex items-center gap-12 mt-16">
              <div className="flex flex-col">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-8 w-8 lg:h-10 lg:w-10 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <span className="text-black text-lg lg:text-xl font-medium">4.5 stars</span>
                  <p className="text-gray-500 text-lg lg:text-xl">130+ reviews</p>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-8 w-8 lg:h-10 lg:w-10 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <span className="text-black text-lg lg:text-xl font-medium">4.8 stars</span>
                  <p className="text-gray-500 text-lg lg:text-xl">130+ reviews</p>
                </div>
              </div>
            </div>

            {/* Team Avatars */}
            <div className="flex items-center gap-8 mt-12">
              {/* Sales */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden">
                  <img 
                    src={salesAvatarImage} 
                    alt="Sales Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-700 text-lg lg:text-xl font-medium">Sales</span>
              </div>

              {/* Engineering */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                  <img 
                    src={engineeringAvatarImage} 
                    alt="Engineering Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-500 text-lg lg:text-xl font-medium">Engineering</span>
              </div>

              {/* Customer Support */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
                  <img 
                    src={customerSupportAvatarImage} 
                    alt="Customer Support Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-400 text-lg lg:text-xl font-medium">Customer Support</span>
              </div>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 relative flex justify-center lg:justify-end">
            {/* Oraclio logo decoration */}
            <div className="absolute w-[68px] h-[68px] top-[-20px] left-[258px] z-50 flex items-center justify-center">
              <svg
                className="w-full h-full text-blue-500 transform transition-transform duration-300 hover:rotate-12"
                viewBox="0 0 100 100"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 0 C75 0 100 25 100 50 C100 75 75 100 50 100 C25 100 0 75 0 50 C0 25 25 0 50 0 Z M50 20 C65 20 80 35 80 50 C80 65 65 80 50 80 C35 80 20 65 20 50 C20 35 35 20 50 20 Z" />
                <rect
                  x="35"
                  y="35"
                  width="30"
                  height="30"
                  rx="5"
                  ry="5"
                  fill="#60A5FA"
                  transform="rotate(45 50 50)"
                />
              </svg>
            </div>


            <div className="thick-colorful-border w-full max-w-[652px] h-[509px] shadow-xl">
              <Card className="card-inner border-0 shadow-none">
                <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mt-4">
                    <p className="font-medium text-gray-800 text-base">
                      Prep me for my meeting with Acme Corp, include Salesforce
                      notes, Jira tickets, kickoff doc, and notes from
                      #project-channel
                    </p>
                    <div className="flex items-center mt-4">
                      <SearchIcon className="h-6 w-6 text-gray-400" />
                      <div className="w-full h-2 bg-gray-200 rounded-full ml-2 relative overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* AI Search Indicators */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-gray-200 shadow-sm">
                        <SiSlack className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600">Searching Slack...</span>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-gray-200 shadow-sm">
                        <SiJira className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-600">Searching Jira...</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-gray-200 shadow-sm">
                        <SiWhatsapp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">Searching WhatsApp...</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-blue-100 text-blue-800 border-transparent rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Company
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-transparent rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Document
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-transparent rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Slack channel
                    </Badge>
                    <span className="text-gray-500 text-xs leading-4">+14</span>
                  </div>

                  <div className="flex items-start mt-4">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">AI</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-black text-sm">
                        Sales Agent
                      </p>
                      <div className="space-y-2 mt-2">
                        <div className="w-[566px] h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-[509px] h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-[226px] h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-[566px] h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-[425px] h-4 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">
                      Connected sources:
                    </span>
                    <div className="flex -space-x-2">
                      {/* Notion */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-black flex items-center justify-center">
                        <FileTextIcon className="w-4 h-4 text-white" />
                      </div>
                      {/* Slack */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-purple-600 flex items-center justify-center">
                        <MessageSquareIcon className="w-4 h-4 text-white" />
                      </div>
                      {/* Google Drive */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-blue-500 flex items-center justify-center">
                        <FolderIcon className="w-4 h-4 text-white" />
                      </div>
                      {/* Salesforce */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-blue-400 flex items-center justify-center">
                        <CloudIcon className="w-4 h-4 text-white" />
                      </div>
                      {/* +14 counter */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-gray-600 text-xs">+14</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 rounded-[10px] border p-2 mx-4 mt-2">
                  <Input
                    className="border-0 bg-transparent text-sm"
                    placeholder="Ask anything about Oraclio..."
                  />
                  <div className="flex">
                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center ml-2">
                      <ArrowRightIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Company Roulette Section */}
        <section className="bg-gray-50 py-24 px-8 overflow-x-hidden relative w-full section-border-both">
          
          {/* First row - scrolling left */}
          <div className="flex items-center mb-8 whitespace-nowrap overflow-x-hidden w-full">
            <div className="flex items-center gap-8 roulette-scroll-left" style={{ minWidth: 'max-content', width: 'max-content' }}>
              {/* First set of companies */}
              {companyLogos.map((company, index) => (
                <div
                  key={`first-${index}`}
                  className="company-card flex items-center justify-center min-w-max"
                >
                  {company.icon && (
                    <div className={`mr-2 ${company.color}`}>
                      {company.icon}
                    </div>
                  )}
                  <span className={`font-bold ${company.color} text-lg whitespace-nowrap`}>
                    {company.name}
                  </span>
                  {company.name === "Duolingo" && (
                    <div className="relative ml-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-3 h-3 absolute top-0.5 left-0.5 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {companyLogos.map((company, index) => (
                <div
                  key={`second-${index}`}
                  className="company-card flex items-center justify-center min-w-max"
                >
                  {company.icon && (
                    <div className={`mr-2 ${company.color}`}>
                      {company.icon}
                    </div>
                  )}
                  <span className={`font-bold ${company.color} text-lg whitespace-nowrap`}>
                    {company.name}
                  </span>
                  {company.name === "Duolingo" && (
                    <div className="relative ml-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-3 h-3 absolute top-0.5 left-0.5 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Second row - scrolling right */}
          <div className="flex items-center mb-8 whitespace-nowrap overflow-x-hidden w-full">
            <div className="flex items-center gap-8 roulette-scroll-right" style={{ minWidth: 'max-content', width: 'max-content' }}>
              {/* First set of companies (reversed order) */}
              {companyLogos.slice().reverse().map((company, index) => (
                <div
                  key={`reverse-first-${index}`}
                  className="company-card flex items-center justify-center min-w-max"
                >
                  {company.icon && (
                    <div className={`mr-2 ${company.color}`}>
                      {company.icon}
                    </div>
                  )}
                  <span className={`font-bold ${company.color} text-lg whitespace-nowrap`}>
                    {company.name}
                  </span>
                  {company.name === "Duolingo" && (
                    <div className="relative ml-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-3 h-3 absolute top-0.5 left-0.5 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {companyLogos.slice().reverse().map((company, index) => (
                <div
                  key={`reverse-second-${index}`}
                  className="company-card flex items-center justify-center min-w-max"
                >
                  {company.icon && (
                    <div className={`mr-2 ${company.color}`}>
                      {company.icon}
                    </div>
                  )}
                  <span className={`font-bold ${company.color} text-lg whitespace-nowrap`}>
                    {company.name}
                  </span>
                  {company.name === "Duolingo" && (
                    <div className="relative ml-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-3 h-3 absolute top-0.5 left-0.5 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <h2 className="font-bold text-gray-900 text-4xl leading-10">
              The world's leading enterprises put AI to work with Oraclio.
            </h2>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-50 py-24 px-8 section-border-left">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 space-y-8">
              <span className="text-gray-600 text-sm tracking-wider uppercase">
                CONNECTIONS
              </span>
              <div className="flex items-start gap-6">
                <h2 className="font-bold text-gray-900 text-4xl md:text-6xl leading-[60px] max-w-[522px]">
                  Oraclio works where you work.
                </h2>
                <img 
                  src="/mascot.webp" 
                  alt="Oraclio mascot" 
                  className="w-64 h-64 object-contain flex-shrink-0 float-animation"
                />
              </div>
              <p className="font-normal text-gray-700 text-xl leading-7 max-w-[600px]">
                Connect all your existing applications. Experience the power of
                your company's collective knowledge all in one place.
              </p>
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setLocation("/integrations")}
                  className="glean-button text-white h-[72px] w-[184px] shadow-lg text-lg font-medium cursor-pointer"
                >
                  <span>See all integrations</span>
                </button>
                <button 
                  onClick={() => setIsVideoOpen(true)}
                  className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <span className="font-medium text-gray-700 text-sm">
                    Watch video
                  </span>
                  <PlayIcon className="h-6 w-6 ml-2" />
                </button>
              </div>
            </div>

            <div className="md:w-1/2 mt-12 md:mt-0 relative">
              <div className="relative flex items-center justify-center min-h-[600px] w-full">
                {/* Background circles with precise positioning */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[500px] h-[500px] rounded-full border-2 border-blue-200 absolute opacity-40"></div>
                  <div className="w-[350px] h-[350px] bg-blue-50 rounded-full absolute opacity-70"></div>
                  <div className="w-[250px] h-[250px] bg-blue-100 rounded-full absolute opacity-50"></div>
                </div>

                {/* Central Oraclio element */}
                <div className="w-[150px] h-[150px] bg-white rounded-full shadow-2xl z-30 flex flex-col items-center justify-center relative border border-gray-100">
                  <OraclioLogo size="md" showText={false} />
                </div>

                {/* Rotating container for integration icons */}
                <div className="absolute w-[500px] h-[500px] rotate-clockwise">
                  {/* Integration icons positioned with exact pixel positioning */}
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ top: '25px', left: 'calc(50% - 28px)' }}>
                    <img
                      src="/figmaAssets/frame-21.svg"
                      alt="Integration"
                      className="w-6 h-6 counter-rotate"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ top: 'calc(50% - 28px)', right: '25px' }}>
                    <img
                      src="/figmaAssets/frame-4.svg"
                      alt="Integration"
                      className="w-6 h-6 counter-rotate"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ bottom: '25px', left: 'calc(50% - 28px)' }}>
                    <div className="w-8 h-8 bg-[#2fc7f7] rounded-full flex items-center justify-center counter-rotate shadow-sm">
                      <span className="font-bold text-white text-xs">B24</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ top: 'calc(50% - 28px)', left: '25px' }}>
                    <img
                      src="/figmaAssets/frame-20.svg"
                      alt="Integration"
                      className="w-6 h-6 counter-rotate"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ top: '100px', right: '100px' }}>
                    <img
                      src="/figmaAssets/frame-18.svg"
                      alt="Integration"
                      className="w-6 h-6 counter-rotate"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full shadow-xl absolute border border-gray-100 flex items-center justify-center integration-icon" style={{ bottom: '100px', left: '100px' }}>
                    <img
                      src="/figmaAssets/frame-16.svg"
                      alt="Integration"
                      className="w-6 h-6 counter-rotate"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-8 section-border-right">
          <h2 className="text-center font-bold text-5xl mb-16">
            Oraclio saves up to <span className="text-blue-600">110</span>{" "}
            hours per user/year
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-100 pt-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`px-4 ${index < 3 ? "border-r border-gray-100" : ""}`}
              >
                <AnimatedCounter end={stat.value} duration={2500} />
                <p className="font-normal text-gray-700 text-base mt-6 max-w-[226px]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-16">
            <span className="font-medium text-blue-600 text-lg">
              See the Forrester Report
            </span>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center ml-4">
              <ArrowRightIcon className="w-5 h-5 text-green-700" />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-blue-600 py-24 px-8 section-border-both">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <h2 className="font-bold text-white text-5xl leading-[48px]">
                See what our{" "}
                <span className="text-lime-300">customers say</span>
              </h2>
            </div>

            <div className="md:w-2/3 mt-8 md:mt-0">
              <div className="flex flex-wrap gap-4 mb-12">
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[120px] justify-center">
                  <span className="text-white font-bold text-lg">Booking.com</span>
                </div>
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[140px] justify-center">
                  <span className="text-white font-bold text-base">Deutsche Telekom</span>
                </div>
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[80px] justify-center">
                  <span className="text-white font-bold text-xl">bill</span>
                </div>
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[100px] justify-center">
                  <SiWebflow className="w-6 h-6 text-white" />
                </div>
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[110px] justify-center">
                  <span className="text-white font-bold text-lg">workato</span>
                </div>
                <div className="bg-[#ffffff33] text-white rounded h-12 px-6 flex items-center min-w-[120px] justify-center">
                  <span className="text-white font-bold text-lg">CONFLUENT</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card
                    key={index}
                    className="bg-[#3b82f680] text-white rounded-3xl border-none"
                  >
                    <CardContent className="p-8">
                      <div className="bg-[#ffffff33] text-white rounded h-10 px-4 mb-8 inline-flex items-center">
                        {testimonial.company === "Deutsche Telekom" ? (
                          <span className="text-white font-medium text-sm">Deutsche Telekom</span>
                        ) : testimonial.company === "Bill" ? (
                          <span className="text-white font-medium text-sm">Bill</span>
                        ) : (
                          <span className="text-white font-medium text-sm">{testimonial.company}</span>
                        )}
                      </div>
                      <p className="font-normal text-white text-xl leading-7 mb-12">
                        {testimonial.text}
                      </p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-400 rounded-full mr-4 overflow-hidden">
                          <img 
                            src={index === 0 ? testimonialAvatarImage : testimonialAvatar2Image} 
                            alt="Testimonial Author" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">
                            {testimonial.author}
                          </p>
                          <p className="font-normal text-blue-100 text-base">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mt-8">
                        <span className="font-medium text-white text-base">
                          View case study
                        </span>
                        <div className="w-8 h-8 bg-lime-300 rounded-full flex items-center justify-center ml-4">
                          <ArrowRightIcon className="w-5 h-5 text-green-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-32 px-8 section-border-left">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-bold text-gray-900 text-5xl leading-tight mb-6">
                Powerful AI for your entire team
              </h2>
              <p className="font-normal text-gray-600 text-xl leading-8 max-w-2xl mx-auto">
                Oraclio helps everyone in your organization work smarter and
                faster with intelligent insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-white rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xl leading-7 mb-4">
                      {feature.title}
                    </h3>
                    <p className="font-normal text-gray-600 text-base leading-6">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-lime-300 py-32 px-8 text-center overflow-hidden">
          {/* Geometric shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-lime-300 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-cyan-200 to-transparent opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-cyan-200 to-transparent opacity-40"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-bold text-white text-6xl md:text-7xl leading-tight mb-12">
              Work AI for all.
            </h1>
            <div className="flex justify-center">
              <button className="glean-button text-white h-16 w-40 shadow-lg text-lg font-medium">
                <span>Get a demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 pt-20 pb-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
              {footerLinks.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-white text-base mb-6">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="font-normal text-gray-400 text-sm hover:text-white transition-colors duration-200">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Separator className="mb-12 bg-gray-700" />

            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white">
                <OraclioLogo size="md" />
              </div>
              <p className="font-normal text-gray-400 text-sm mt-6 md:mt-0">
                © 2025 Oraclio. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent 
          className="max-w-4xl w-full p-0 bg-black border-0"
          aria-describedby="video-description"
        >
          <DialogTitle className="sr-only">Oraclio Demo Video</DialogTitle>
          <div className="sr-only">
            <p id="video-description">Watch this video to learn about Oraclio's features and capabilities</p>
          </div>
          <div className="relative w-full h-0 pb-[56.25%]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/oTgAW0f54vw?autoplay=1"
              title="Oraclio Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
