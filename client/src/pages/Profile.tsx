import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, insertUserSchema } from "@shared/schema";
import { User as UserIcon, Building2, Mail, Phone, MapPin, Calendar, Settings, Shield, ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const roleLabels: Record<string, string> = {
  owner: "Owner",
  product: "Product Manager", 
  sales: "Sales Manager",
  hr: "HR Manager",
  ops: "Operations Manager",
  finance: "Finance Manager"
};

const toolLabels: Record<string, string> = {
  bitrix24: "Bitrix24",
  excel: "Excel",
  googlesheets: "Google Sheets",
  slack: "Slack",
  trello: "Trello",
  notion: "Notion",
  asana: "Asana",
  jira: "Jira"
};

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference for profile page
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode");
    if (darkModePreference === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Cleanup function to remove dark mode when leaving profile
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
    
    toast({
      title: newDarkMode ? "Dark mode enabled" : "Light mode enabled",
      description: "Theme preference saved.",
    });
  };

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      company: "",
      position: "",
      department: "",
      bio: "",
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        company: user.company || "",
        position: user.position || "",
        department: user.department || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { email: string }) => {
      console.log("Sending profile update:", data);
      return await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      console.log("Profile update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully",
      });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Form submission data:", data);
    // Add email to the data since it's not in the form but needed for the API
    const updateData = {
      ...data,
      email: user?.email || ""
    };
    updateProfileMutation.mutate(updateData);
  };

  const getInitials = () => {
    if (!user?.firstName || !user?.lastName) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header - Same as Dashboard */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
              <AlertTriangle className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3 bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-700">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">{user?.email || "User"}</div>
                <div className="text-xs text-gray-400">{user?.role || "Analyst"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl space-y-6 mt-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <CardDescription className="text-lg">
                  {user?.position || "User"}
                </CardDescription>
                {user?.role && (
                  <Badge variant="secondary" className="mt-2">
                    {roleLabels[user.role] || user.role}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-400 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-400 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Email</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400">
                    {user?.email || "Not specified"} (cannot be changed)
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="text-gray-300">Company</Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-gray-300">Department</Label>
                    <Input
                      id="department"
                      {...form.register("department")}
                      className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="position" className="text-gray-300">Position</Label>
                  <Input
                    id="position"
                    {...form.register("position")}
                    className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    {...form.register("bio")}
                    className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{user?.email || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{user?.phone || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                      <p className="text-gray-900 dark:text-white">{user?.company || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-white">{user?.department || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {user?.bio && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                    <p className="text-gray-900 dark:text-white">{user.bio}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Дата регистрации</p>
                    <p className="text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : "Неизвестно"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tools */}
          {user?.tools && user.tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Инструменты</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.tools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {toolLabels[tool] || tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Настройки</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email уведомления</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Получать уведомления на email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push уведомления</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Получать уведомления в браузере
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">ID пользователя</span>
                <span className="font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Роль</span>
                <span>{user?.role ? roleLabels[user.role] || user.role : "Не указана"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Статус</span>
                <Badge variant="outline" className="text-green-600">
                  Активен
                </Badge>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}