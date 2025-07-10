import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import OraclioLogo from "@/components/OraclioLogo";
import {
  Check,
  ArrowRight,
  Star,
  Users,
  Zap,
  Shield,
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

const pricingPlans = [
  {
    name: "Basic",
    price: "$295",
    period: "month",
    description: "billed annually",
    color: "blue",
    features: [
      "Up to 35 users /month",
      "Unlimited searches",
      "AI & Analytics - FREE",
      "USD International payments - $10 + 0.20% / transaction",
      "FX International payments - FREE",
      "No overage fees",
      "Basic integrations"
    ],
    cta: "Chat with us",
    popular: false
  },
  {
    name: "Pro",
    price: "$595",
    period: "month", 
    description: "billed annually",
    color: "purple",
    features: [
      "More than 35 users /month",
      "Unlimited searches",
      "AI & Analytics - FREE", 
      "USD International payments - $10 + 0.20% / transaction",
      "FX International payments - FREE",
      "No overage fees",
      "Advanced integrations",
      "Priority support"
    ],
    cta: "Chat with us",
    popular: true
  },
  {
    name: "Custom",
    price: "Contact us",
    period: "",
    description: "for enterprise pricing",
    color: "gray",
    features: [
      "Unlimited users",
      "Unlimited searches",
      "AI & Analytics - FREE",
      "Custom pricing for payments",
      "FX International payments - FREE", 
      "No overage fees",
      "All integrations",
      "Dedicated support",
      "Custom workflows"
    ],
    cta: "Contact sales",
    popular: false
  }
];

export default function Pricing() {
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
                  <a href="/pricing" className="font-medium text-blue-600 text-sm border-b-2 border-blue-600 pb-1">
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the plan that's right for your team. All plans include our core AI features 
            with no hidden fees.
          </p>
          
          {/* Toggle for annual/monthly */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-gray-600">Monthly</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" defaultChecked />
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
              </div>
            </div>
            <span className="text-gray-900 font-medium">Annual</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Save 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.popular 
                    ? 'border-2 border-purple-600 shadow-xl scale-105' 
                    : 'border border-gray-200 shadow-lg'
                } hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-6 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className={`text-2xl font-bold mb-4 ${
                    plan.color === 'blue' ? 'text-blue-600' :
                    plan.color === 'purple' ? 'text-purple-600' :
                    'text-gray-900'
                  }`}>
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.color === 'blue' ? 'bg-blue-100' :
                          plan.color === 'purple' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.color === 'blue' ? 'text-blue-600' :
                            plan.color === 'purple' ? 'text-purple-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="glean-button text-white w-full h-12 shadow-lg text-sm font-medium">
                    <span className="flex items-center justify-center">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Compare all features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See everything that's included in each plan to make the best choice for your team.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="p-6 font-semibold text-gray-900">Features</div>
              <div className="p-6 text-center font-semibold text-blue-600">Basic</div>
              <div className="p-6 text-center font-semibold text-purple-600">Pro</div>
              <div className="p-6 text-center font-semibold text-gray-900">Custom</div>
            </div>

            {[
              { feature: "Number of users", basic: "Up to 35", pro: "35+", custom: "Unlimited" },
              { feature: "AI search queries", basic: "Unlimited", pro: "Unlimited", custom: "Unlimited" },
              { feature: "Data connectors", basic: "50+", pro: "100+", custom: "All" },
              { feature: "Advanced analytics", basic: "✓", pro: "✓", custom: "✓" },
              { feature: "Custom workflows", basic: "Basic", pro: "Advanced", custom: "Unlimited" },
              { feature: "API access", basic: "Limited", pro: "Full", custom: "Full" },
              { feature: "Support", basic: "Email", pro: "Priority", custom: "Dedicated" },
              { feature: "SSO & SAML", basic: "—", pro: "✓", custom: "✓" },
              { feature: "Custom integrations", basic: "—", pro: "Limited", custom: "Unlimited" }
            ].map((row, index) => (
              <div key={index} className={`grid grid-cols-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="p-4 font-medium text-gray-900">{row.feature}</div>
                <div className="p-4 text-center text-gray-700">{row.basic}</div>
                <div className="p-4 text-center text-gray-700">{row.pro}</div>
                <div className="p-4 text-center text-gray-700">{row.custom}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing adjustments."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise accounts."
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 14-day free trial for all plans. No credit card required to get started."
              },
              {
                q: "How does billing work for additional users?",
                a: "Additional users are billed at the per-user rate for your plan. We provide prorated billing for mid-cycle additions."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of teams already using Oraclio to supercharge their productivity.
          </p>
          <div className="flex items-center justify-center gap-6">
            <button className="glean-button text-white h-14 px-8 shadow-lg text-lg font-medium">
              <span className="flex items-center">
                Start free trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 h-14 px-8">
              <MessageCircle className="w-5 h-5 mr-2" />
              Talk to sales
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