import React, { useState } from 'react';
import {
  Plus,
  Home,
  BarChart2,
  Inbox,
  Library,
  Settings,
  Users,
  Zap,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Share2,
  Sparkles,
  Paperclip,
  Mic,
  ArrowUp,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const SidebarLink = ({ icon: Icon, text, active = false, badgeCount = 0 }: { icon: React.ElementType, text: string, active?: boolean, badgeCount?: number }) => (
  <a
    href="#"
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="mr-3 h-5 w-5" />
    <span>{text}</span>
    {badgeCount > 0 && (
      <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {badgeCount}
      </span>
    )}
  </a>
);

const RecentChatItem = ({ text }: { text: string }) => (
  <a href="#" className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md truncate">
    {text}
  </a>
);

const SuggestionCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="hover:bg-gray-50 cursor-pointer">
    <CardContent className="p-4">
      <div className="flex items-start">
        <Icon className="h-5 w-5 text-gray-500 mr-4 mt-1" />
        <div>
          <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const NewDashboard = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setSearchResult('');

    try {
      const response = await fetch('/api/corporate-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery, userId: 3 }), // Using hardcoded userId for now
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setSearchResult(data.response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 font-semibold text-lg text-gray-800">Corporate AI</span>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          <Button className="w-full justify-start text-sm font-medium">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          <nav className="space-y-1">
            <SidebarLink icon={Home} text="Home" active />
            <div>
              <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Other</h3>
              <SidebarLink icon={BarChart2} text="Performance" />
              <SidebarLink icon={Inbox} text="Inbox" badgeCount={2} />
            </div>
            <div>
              <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Chats</h3>
              <SidebarLink icon={Library} text="Library" />
              <RecentChatItem text="Explain in detail how to implement..." />
              <RecentChatItem text="Recommended tools, as well as..." />
              <RecentChatItem text="Noted at every stage. Include..." />
              <RecentChatItem text="Viewing business metrics post..." />
            </div>
            <div>
              <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</h3>
              <SidebarLink icon={Settings} text="Integration" />
              <SidebarLink icon={Users} text="Team Member" />
              <SidebarLink icon={Zap} text="Automation" />
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
           <SidebarLink icon={Settings} text="Settings" />
           <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/150?img=10" alt="Alex Satrio" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-semibold text-gray-800">Alex Satrio</p>
                <p className="text-xs text-gray-500">Lead Product Design</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-800">Corporate AI 3.5</h1>
            <ChevronDown className="h-5 w-5 text-gray-500 ml-1" />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="text-sm font-medium">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
            {isLoading && (
              <div className="flex-1 flex items-center justify-center">
                <p>Loading...</p>
              </div>
            )}
            {error && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            {searchResult && (
              <div className="prose lg:prose-xl">
                <p>{searchResult}</p>
              </div>
            )}
            {!isLoading && !error && !searchResult && (
              <div className="text-center my-auto">
                <div className="inline-block p-4 bg-gray-100 rounded-full">
                  <div className="p-3 bg-white rounded-full shadow">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-800">Hello, Alex Satrio</h2>
                <p className="mt-2 text-lg text-gray-500">How can I help you today?</p>
                <div className="w-full grid grid-cols-2 gap-4 mt-12">
                  <SuggestionCard
                    icon={BookOpen}
                    title="Explain in detail"
                    description="how to implement a new feature"
                  />
                  <SuggestionCard
                    icon={MessageSquare}
                    title="Give me some ideas"
                    description="for a new blog post about AI"
                  />
                  <SuggestionCard
                    icon={BookOpen}
                    title="Explain in detail"
                    description="how to implement a new feature"
                  />
                  <SuggestionCard
                    icon={MessageSquare}
                    title="Give me some ideas"
                    description="for a new blog post about AI"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <Card className="p-2 shadow-sm border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Input
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button variant="ghost" size="icon" className="text-gray-500" disabled={isLoading}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500" disabled={isLoading}>
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="rounded-lg" type="submit" disabled={isLoading || !searchQuery.trim()}>
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </form>
            <p className="text-center text-xs text-gray-400 mt-2">
              Oraclio AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewDashboard;
