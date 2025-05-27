
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  Users, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const shiftTypes = [
  { id: 1, name: "Morning", time: "6:00 AM - 2:00 PM", color: "bg-hss-blue-bright" },
  { id: 2, name: "Afternoon", time: "2:00 PM - 10:00 PM", color: "bg-hss-purple-vivid" },
  { id: 3, name: "Night", time: "10:00 PM - 6:00 AM", color: "bg-hss-purple-dark" },
];

const departments = [
  { id: 1, name: "Emergency" },
  { id: 2, name: "Cardiology" },
  { id: 3, name: "Neurology" },
  { id: 4, name: "Pediatrics" },
  { id: 5, name: "Oncology" },
  { id: 6, name: "Radiology" },
  { id: 7, name: "Laboratory" },
];

const staffMembers = [
  { id: 1, name: "Dr. Emily Johnson", role: "Doctor", dept: "Cardiology", avatar: "/placeholder.svg" },
  { id: 2, name: "Michael Smith", role: "Nurse", dept: "Emergency", avatar: "/placeholder.svg" },
  { id: 3, name: "Sarah Wilson", role: "Technician", dept: "Radiology", avatar: "/placeholder.svg" },
  { id: 4, name: "Lisa Thompson", role: "Nurse", dept: "Pediatrics", avatar: "/placeholder.svg" },
  { id: 5, name: "Robert Chen", role: "Technician", dept: "Laboratory", avatar: "/placeholder.svg" },
];

const Scheduling = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedShiftType, setSelectedShiftType] = useState("all");

  // Navigate to previous month
  const previousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  // Navigate to next month
  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Get current month name and year
  const currentMonthName = currentMonth.toLocaleString('default', { month: 'long' });
  const currentYear = currentMonth.getFullYear();

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
            <p className="text-muted-foreground">Manage and view staff schedules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              View Month
            </Button>
            <Button className="bg-hss-purple-vivid hover:bg-hss-purple-vivid/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Shift
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar card */}
          <Card className="md:col-span-2 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Shift Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentMonthName} {currentYear}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="flex gap-4">
                  {shiftTypes.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-1.5 text-sm">
                      <div className={`w-3 h-3 rounded-full ${shift.color}`}></div>
                      <span>{shift.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                month={currentMonth}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Shifts for selected date */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Shifts</CardTitle>
                <div className="bg-muted/50 py-1 px-3 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {date?.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Filters</div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name.toLowerCase()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Shift Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shifts</SelectItem>
                        {shiftTypes.map((shift) => (
                          <SelectItem key={shift.id} value={shift.name.toLowerCase()}>
                            {shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Morning Shift */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="bg-hss-blue-bright/20 px-4 py-2 flex items-center justify-between border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="bg-hss-blue-bright w-3 h-3 rounded-full"></div>
                        <span className="font-medium">Morning Shift</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        <span>6:00 AM - 2:00 PM</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Dr. Emily Johnson" />
                            <AvatarFallback>EJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Dr. Emily Johnson</div>
                            <div className="text-xs text-muted-foreground">Cardiology</div>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Confirmed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Michael Smith" />
                            <AvatarFallback>MS</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Michael Smith</div>
                            <div className="text-xs text-muted-foreground">Emergency</div>
                          </div>
                        </div>
                        <Badge className="bg-hss-blue-bright">Pending</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Afternoon Shift */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="bg-hss-purple-vivid/20 px-4 py-2 flex items-center justify-between border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="bg-hss-purple-vivid w-3 h-3 rounded-full"></div>
                        <span className="font-medium">Afternoon Shift</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        <span>2:00 PM - 10:00 PM</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Lisa Thompson" />
                            <AvatarFallback>LT</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Lisa Thompson</div>
                            <div className="text-xs text-muted-foreground">Pediatrics</div>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Confirmed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Sarah Wilson" />
                            <AvatarFallback>SW</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Sarah Wilson</div>
                            <div className="text-xs text-muted-foreground">Radiology</div>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Confirmed</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Night Shift */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="bg-hss-purple-dark/20 px-4 py-2 flex items-center justify-between border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="bg-hss-purple-dark w-3 h-3 rounded-full"></div>
                        <span className="font-medium">Night Shift</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        <span>10:00 PM - 6:00 AM</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Robert Chen" />
                            <AvatarFallback>RC</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Robert Chen</div>
                            <div className="text-xs text-muted-foreground">Laboratory</div>
                          </div>
                        </div>
                        <Badge className="bg-red-500">Not confirmed</Badge>
                      </div>
                      <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-500 font-medium">Need 1 more staff member</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Availability Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Staff Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="available">
              <TabsList className="mb-4 bg-muted/50 border border-border/50">
                <TabsTrigger value="available">Available Today</TabsTrigger>
                <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
                <TabsTrigger value="all">All Staff</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffMembers.slice(0, 3).map((staff) => (
                    <div key={staff.id} className="flex items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground">{staff.role} • {staff.dept}</div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unavailable" className="space-y-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffMembers.slice(3, 5).map((staff) => (
                    <div key={staff.id} className="flex items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground">{staff.role} • {staff.dept}</div>
                      </div>
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="space-y-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="flex items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground">{staff.role} • {staff.dept}</div>
                      </div>
                      <div className="flex items-center">
                        {staff.id <= 3 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Scheduling;
