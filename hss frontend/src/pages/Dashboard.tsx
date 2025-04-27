
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  ClipboardCheck, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  User,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-hss-purple-vivid">Admin View</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 animate-slide-in-bottom [animation-delay:100ms]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">124</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">+3%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 animate-slide-in-bottom [animation-delay:200ms]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">38</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    12 ending in the next 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 animate-slide-in-bottom [animation-delay:300ms]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">86%</div>
                  <Progress value={86} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    8 staff with expiring certifications
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 animate-slide-in-bottom [animation-delay:400ms]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                    <span>3 urgent requests</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <div className="grid gap-6 md:grid-cols-7">
              <Card className="col-span-7 md:col-span-4 border-border/50 animate-slide-in-bottom [animation-delay:500ms]">
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Newest compliance and scheduling alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="rounded-full bg-amber-100 p-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Certification Expiring</p>
                          <Badge variant="outline" className="text-xs">High</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Dr. James Wilson's medical license expires in 14 days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="rounded-full bg-red-100 p-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Shift Coverage Gap</p>
                          <Badge variant="outline" className="text-xs">Critical</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No registered nurse assigned for Night Shift (10PM-6AM) on Friday
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="rounded-full bg-green-100 p-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Compliance Completed</p>
                          <Badge variant="outline" className="text-xs">Info</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Annual safety training completed by 28 staff members
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Shifts */}
              <Card className="col-span-7 md:col-span-3 border-border/50 animate-slide-in-right">
                <CardHeader>
                  <CardTitle>Upcoming Shifts</CardTitle>
                  <CardDescription>Next 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg" alt="Emily Johnson" />
                        <AvatarFallback>EJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Emily Johnson</p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            08:00 AM - 04:00 PM
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-blue-bright">Nurse</Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg" alt="David Smith" />
                        <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">David Smith</p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            09:00 AM - 05:00 PM
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-purple-medium">Doctor</Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg" alt="Sarah Lee" />
                        <AvatarFallback>SL</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Sarah Lee</p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            02:00 PM - 10:00 PM
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-blue-bright">Nurse</Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg" alt="Michael Chen" />
                        <AvatarFallback>MC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Michael Chen</p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            06:00 PM - 06:00 AM
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-hss-gray-neutral">Technician</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Shift Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Staff Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>All recent system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="rounded-full bg-muted p-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Alert #{i}</p>
                          <Badge variant="outline" className="text-xs">Status</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sample alert description that would appear in the system
                        </p>
                      </div>
                    </div>
                  ))}
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
