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
import {
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
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

  const getAuthToken = () => {
    const token = document.cookie.split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    return token;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [statsRes, alertsRes, shiftsRes] = await Promise.all([
          fetch("https://hss-backend.onrender.com/api/dashboard/stats", {
            headers,
            credentials: "include"
          }),
          fetch("https://hss-backend.onrender.com/api/dashboard/alerts", {
            headers,
            credentials: "include"
          }),
          fetch("https://hss-backend.onrender.com/api/dashboard/shifts", {
            headers,
            credentials: "include"
          })
        ]);

        if (statsRes.status === 401 || alertsRes.status === 401 || shiftsRes.status === 401) {
          navigate('/login');
          return;
        }

        if (!statsRes.ok || !alertsRes.ok || !shiftsRes.ok) {
          throw new Error(`HTTP error! status: ${statsRes.status}`);
        }

        const [statsData, alertsData, shiftsData] = await Promise.all([
          statsRes.json(),
          alertsRes.json(),
          shiftsRes.json()
        ]);

        setStats(statsData);
        setAlerts(alertsData);
        setShifts(shiftsData);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
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
    if (level === "critical")
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (level === "high")
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hss-purple-vivid"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-hss-purple-vivid text-white rounded"
          >
            Retry
          </button>
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
                  <progress
                    className="progress progress-success w-full"
                    value={complianceRate}
                    max={100}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {stats.pendingApprovals}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
              <Card className="col-span-7 md:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>
                    Newest compliance and scheduling alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="rounded-full bg-muted p-2">
                        {alertIcon(a.level)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{a.title}</p>
                          <Badge variant="outline" className="text-xs">
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
                <CardContent>
                  {shifts.map((s) => (
                    <div key={s.id} className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={s.avatarUrl || "/placeholder.svg"}
                          alt={s.name}
                        />
                        <AvatarFallback>
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{s.name}</p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(s.start).toLocaleTimeString()} -{" "}
                            {new Date(s.end).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-blue-bright">{s.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <p className="text-muted-foreground">Analytics content placeholder</p>
          </TabsContent>

          <TabsContent value="alerts">
            <p className="text-muted-foreground">All alerts placeholder</p>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;