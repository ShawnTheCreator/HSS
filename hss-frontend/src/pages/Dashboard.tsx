import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stats {
  totalStaff: number;
  activeShifts: number;
  compliance: { valid: number; invalid: number };
  pendingApprovals: number;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  level: "high" | "critical" | "info";
}

interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  role: string;
  avatarUrl?: string;
}

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:5000/api" 
    : "https://hss-backend.onrender.com/api");

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStaff: 0,
    activeShifts: 0,
    compliance: { valid: 0, invalid: 0 },
    pendingApprovals: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Token handling function
  const getAuthToken = () => {
    // 1. Check localStorage first
    const localStorageToken = localStorage.getItem('fallback_token');
    if (localStorageToken) return localStorageToken;
    
    // 2. Fallback to cookies
    const cookieToken = document.cookie.split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    return cookieToken || null;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        console.log("Dashboard token check:", token);
        
        if (!token) {
          console.warn("No authentication token found, redirecting to login");
          navigate("/login");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Corrected endpoints with /auth/dashboard path
        const endpoints = [
          `${API_BASE_URL}/auth/dashboard/stats`,
          `${API_BASE_URL}/auth/dashboard/alerts`,
          `${API_BASE_URL}/auth/dashboard/shifts`,
        ];

        // Handle responses with better error checking
        const handleResponse = async (res: Response, endpointName: string) => {
          const contentType = res.headers.get('content-type');
          
          if (!res.ok) {
            // Handle HTML responses (like 404 pages)
            if (contentType?.includes('text/html')) {
              const text = await res.text();
              throw new Error(`${endpointName} returned HTML: ${text.substring(0, 100)}...`);
            }
            
            // Try to parse JSON error
            try {
              const errorData = await res.json();
              return errorData;
            } catch (e) {
              throw new Error(`${endpointName} request failed with status ${res.status}`);
            }
          }
          
          // Handle successful JSON responses
          if (contentType?.includes('application/json')) {
            return res.json();
          }
          
          throw new Error(`Unexpected response type from ${endpointName}`);
        };

        // Create reusable fetch function
        const fetchWithAuth = (url: string) => {
          return fetch(url, {
            headers,
            credentials: "include"
          });
        };

        // Fetch all dashboard data in parallel - FIXED SYNTAX
        const [statsRes, alertsRes, shiftsRes] = await Promise.all([
          fetchWithAuth(endpoints[0]),
          fetchWithAuth(endpoints[1]),
          fetchWithAuth(endpoints[2])
        ]);

        const [statsData, alertsData, shiftsData] = await Promise.all([
          handleResponse(statsRes, "Stats"),
          handleResponse(alertsRes, "Alerts"),
          handleResponse(shiftsRes, "Shifts"),
        ]);

        // Check for error properties in responses
        if (statsData.error) throw new Error(statsData.error);
        if (alertsData.error) throw new Error(alertsData.error);
        if (shiftsData.error) throw new Error(shiftsData.error);

        setStats(statsData);
        setAlerts(alertsData);
        setShifts(shiftsData);
        
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard data";
        setError(errorMessage);
        
        // Handle authentication errors
        if (errorMessage.includes("401") || errorMessage.includes("token")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const complianceRate = (() => {
    const { valid, invalid } = stats.compliance;
    const total = valid + invalid;
    return total ? Math.round((valid / total) * 100) : 0;
  })();

  const alertIcon = (level: string) => {
    if (level === "critical") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (level === "high") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hss-purple-vivid"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium text-red-800">Couldn't load dashboard</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-hss-purple-vivid text-white rounded-md hover:bg-hss-purple-dark transition"
                >
                  Retry Now
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Badge className="bg-hss-purple-vivid">Admin View</Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.totalStaff}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.activeShifts}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance</CardTitle>
                  <CardDescription>{complianceRate}% valid</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${complianceRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.pendingApprovals}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
              <Card className="col-span-7 md:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Newest compliance and scheduling alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50 transition hover:bg-muted/30"
                    >
                      <div className="rounded-full bg-muted p-2">
                        {alertIcon(a.level)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{a.title}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              a.level === 'critical' ? 'bg-red-100 border-red-300 text-red-800' : 
                              a.level === 'high' ? 'bg-amber-100 border-amber-300 text-amber-800' : 
                              'bg-green-100 border-green-300 text-green-800'
                            }`}
                          >
                            {a.level.charAt(0).toUpperCase() + a.level.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {a.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="col-span-7 md:col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Shifts</CardTitle>
                  <CardDescription>Next 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {shifts.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 p-2 hover:bg-muted/30 rounded-md transition">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={s.avatarUrl || "/placeholder.svg"}
                          alt={s.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-100">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                            {new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-blue-bright whitespace-nowrap">{s.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Analytics visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>All Alerts</CardTitle>
                <CardDescription>Complete alert history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Alert history view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;