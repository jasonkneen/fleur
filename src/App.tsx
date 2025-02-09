import './App.css';
import { Calendar, ChevronRight, Chrome, HardDrive, Mail, Search, Youtube } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card';

const apps = [
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: <Mail className="w-16 h-16 text-red-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC"
  },
  {
    name: "Google Chrome",
    description: "Fast and secure web browser",
    icon: <Chrome className="w-16 h-16 text-blue-500" />,
    category: "Utilities",
    price: "Free",
    developer: "Google LLC"
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: <Calendar className="w-16 h-16 text-green-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC"
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: <HardDrive className="w-16 h-16 text-yellow-500" />,
    category: "Productivity",
    price: "Free",
    developer: "Google LLC"
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    icon: <Youtube className="w-16 h-16 text-red-600" />,
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC"
  }
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mac App Store</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Featured Apps</h2>
            <button className="text-blue-500 hover:text-blue-600 flex items-center">
              See All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <HoverCard key={app.name}>
                <HoverCardTrigger asChild>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        {app.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.category}</p>
                        <button className="mt-2 px-4 py-1 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200">
                          {app.price}
                        </button>
                      </div>
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4 bg-white rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{app.name}</h4>
                    <p className="text-sm text-gray-500">{app.description}</p>
                    <Separator className="my-2" />
                    <p className="text-xs text-gray-400">By {app.developer}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
