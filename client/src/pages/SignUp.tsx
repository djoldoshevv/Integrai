import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import OraclioLogo from "@/components/OraclioLogo";

interface AuthResponse {
  user: {
    id: number;
    email: string;
    companyName?: string;
    role?: string;
    tools?: string[];
    onboardingCompleted?: boolean;
  };
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyName: "",
    companySize: "",
    interest: "",
    agreeToTerms: false,
  });

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          company: data.companyName,
        }),
      });
    },
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      toast({
        title: "Welcome to Oraclio!",
        description: "Your account has been created successfully.",
      });
      setLocation("/onboarding");
    },
    onError: () => {
      toast({
        title: "Signup failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center space-x-8">
            <OraclioLogo size="md" />
            <nav className="hidden md:flex space-x-6">
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 text-sm">Products</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">Customers</span>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 text-sm">Solutions</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 text-sm">Resources</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">About</span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200" onClick={() => setLocation("/sign-in")}>Sign in</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">Get a demo</Button>
          </div>
        </div>
      </header>
      {/* Left Section - Dark Blue */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col justify-center px-12 pt-20">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-lime-400 mb-8 leading-tight">
            Put AI to work. At work.
          </h1>
          
          <div className="space-y-4 mb-12">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-lime-400 flex-shrink-0" />
              <span className="text-white text-lg">Trusted answers grounded in your company's data</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-lime-400 flex-shrink-0" />
              <span className="text-white text-lg">One centralized platform to build with security and speed</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-lime-400 flex-shrink-0" />
              <span className="text-white text-lg">Turnkey implementation of a complex AI ecosystem</span>
            </div>
          </div>

          
        </div>
      </div>
      {/* Right Section - Form */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-12 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join thousands of teams</h2>
              <p className="text-gray-600">Start your AI-powered analytics journey</p>
            </div>



            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                placeholder="Work email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                required
              />
              
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                required
                minLength={6}
              />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                required
              />
              
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                required
              />
            </div>
            
            <Input
              type="text"
              placeholder="Company you work for"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              required
            />
            
            <Select onValueChange={(value) => handleInputChange("companySize", value)}>
              <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="text"
              placeholder="What sparked your interest in Oraclio?"
              value={formData.interest}
              onChange={(e) => handleInputChange("interest", e.target.value)}
              className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
            
            <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-lg">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                By filling out and submitting this form, you are agreeing to our Privacy Policy 
                and to receiving email communications from Oraclio regarding events, 
                webinars, research, and more. You can unsubscribe at any time.
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-lime-400 hover:bg-lime-500 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Signing up..." : "Sign up"}
            </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Login Options - Smaller */}
            <div className="flex space-x-3 mb-6">
              <Button 
                type="button"
                variant="outline"
                className="flex-1 h-10 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                onClick={() => {/* Google OAuth */}}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="flex-1 h-10 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                onClick={() => {/* Facebook OAuth */}}
              >
                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="flex-1 h-10 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                onClick={() => {/* GitHub OAuth */}}
              >
                <svg className="w-4 h-4" fill="#181717" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setLocation("/sign-in")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}