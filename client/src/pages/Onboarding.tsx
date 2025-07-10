import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, User, Settings, Building } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "Owner", label: "Business Owner", icon: Building, description: "CEO, Founder, or Managing Director" },
  { id: "Product", label: "Product Manager", icon: Settings, description: "Product development and strategy" },
  { id: "Sales", label: "Sales Manager", icon: User, description: "Sales operations and revenue growth" },
  { id: "HR", label: "HR Manager", icon: User, description: "Human resources and team management" },
  { id: "Ops", label: "Operations", icon: Settings, description: "Daily operations and processes" },
  { id: "Finance", label: "Finance", icon: Building, description: "Financial planning and analysis" },
];

const tools = [
  "Bitrix24", "1C", "Excel", "Google Sheets", "Notion", "Slack", 
  "WhatsApp Business", "Trello", "Asana", "Monday.com", "Zoho", 
  "Salesforce", "HubSpot", "QuickBooks", "Xero", "Jira"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: { role: string; tools: string[] }) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return apiRequest(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          role: data.role,
          tools: data.tools,
          onboardingCompleted: true,
        }),
      });
    },
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      toast({
        title: "Welcome to Oraclio!",
        description: "Your account has been set up successfully.",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Setup failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast({
        title: "Please select your role",
        description: "Choose the option that best describes your position.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && selectedTools.length === 0) {
      toast({
        title: "Please select at least one tool",
        description: "Choose the tools your business currently uses.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updateUserMutation.mutate({
      role: selectedRole,
      tools: selectedTools,
    });
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Let's set up your Oraclio workspace
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              This helps us customize your experience and provide relevant insights
            </p>
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">Step {step} of 2</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 ? "What's your role?" : "Which tools does your business use?"}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Select the option that best describes your position in the company"
                  : "Select all the tools and platforms your business currently uses"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:border-blue-300 dark:hover:border-blue-600 ${
                          selectedRole === role.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-6 w-6 text-blue-600 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {role.label}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {tools.map((tool) => (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          selectedTools.includes(tool)
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                  
                  {selectedTools.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Selected tools ({selectedTools.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTools.map((tool) => (
                          <Badge key={tool} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={updateUserMutation.isPending}
                >
                  {step === 2 ? (
                    updateUserMutation.isPending ? "Setting up..." : "Complete Setup"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}