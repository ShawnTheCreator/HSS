
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample staff data
const staffMembers = [
  {
    id: 1,
    name: "Dr. Emily Johnson",
    role: "Doctor",
    department: "Cardiology",
    email: "emily.johnson@hss.com",
    phone: "+27 89 762 345",
    status: "active",
    compliant: true,
    availableToday: true,
    availableTomorrow: true,
    shift: "Morning",
    certifications: ["Medical License", "BLS", "ACLS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Michael Smith",
    role: "Nurse",
    department: "Emergency",
    email: "michael.smith@hss.com",
    phone: "+27 89 762 343",
    status: "active",
    compliant: true,
    availableToday: true,
    availableTomorrow: false,
    shift: "Night",
    certifications: ["RN License", "BLS", "PALS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Sarah Wilson",
    role: "Technician",
    department: "Radiology",
    email: "sarah.wilson@hss.com",
    phone: "+27 89 762 342",
    status: "active",
    compliant: false,
    availableToday: false,
    availableTomorrow: true,
    shift: "Evening",
    certifications: ["RT License", "BLS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 4,
    name: "James Rodriguez",
    role: "Doctor",
    department: "Neurology",
    email: "james.rodriguez@hss.com",
    phone: "+27 89 762 341",
    status: "inactive",
    compliant: true,
    availableToday: false,
    availableTomorrow: false,
    shift: "Morning",
    certifications: ["Medical License", "BLS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Nurse",
    department: "Pediatrics",
    email: "lisa.thompson@hss.com",
    phone: "+27 73 762 445",
    status: "active",
    compliant: true,
    availableToday: true,
    availableTomorrow: true,
    shift: "Evening",
    certifications: ["RN License", "BLS", "PALS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 6,
    name: "Robert Chen",
    role: "Technician",
    department: "Laboratory",
    email: "robert.chen@hss.com",
    phone: "+27 74 862 344",
    status: "active",
    compliant: true,
    availableToday: true,
    availableTomorrow: false,
    shift: "Night",
    certifications: ["MLT License", "BLS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 7,
    name: "Olivia Martinez",
    role: "Doctor",
    department: "Oncology",
    email: "olivia.martinez@hss.com",
    phone: "+27 84 762 345",
    status: "active",
    compliant: true,
    availableToday: false,
    availableTomorrow: true,
    shift: "Morning",
    certifications: ["Medical License", "BLS", "ACLS"],
    avatar: "/placeholder.svg",
  },
  {
    id: 8,
    name: "Daniel Lewis",
    role: "Cleaner",
    department: "Housekeeping",
    email: "daniel.lewis@hss.com",
    phone: "+27 81 762 345",
    status: "active",
    compliant: false,
    availableToday: true,
    availableTomorrow: true,
    shift: "Evening",
    certifications: ["BLS"],
    avatar: "/placeholder.svg",
  },
];

// Staff card component
const StaffCard = ({ staff }: { staff: typeof staffMembers[0] }) => {
  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={staff.avatar} alt={staff.name} />
            <AvatarFallback>{staff.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{staff.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={
                    staff.role === "Doctor" ? "bg-hss-purple-medium" :
                    staff.role === "Nurse" ? "bg-hss-blue-bright" :
                    staff.role === "Technician" ? "bg-hss-gray-neutral" :
                    "bg-muted"
                  }>
                    {staff.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{staff.department}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {staff.status === "active" ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500 text-red-500">Inactive</Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Staff</DropdownMenuItem>
                    <DropdownMenuItem>Assign Shift</DropdownMenuItem>
                    <DropdownMenuItem>Check Compliance</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{staff.email}</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{staff.phone}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col text-sm">
                <span className="text-xs text-muted-foreground">Shift</span>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5 text-hss-purple-vivid" />
                  <span>{staff.shift}</span>
                </div>
              </div>
              
              <div className="flex flex-col text-sm">
                <span className="text-xs text-muted-foreground">Today</span>
                <div className="flex items-center gap-1 mt-1">
                  {staff.availableToday ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-red-500">Unavailable</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col text-sm">
                <span className="text-xs text-muted-foreground">Compliance</span>
                <div className="flex items-center gap-1 mt-1">
                  {staff.compliant ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Compliant</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-amber-500">Review Needed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Staff = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");

  // Filter staff based on search query and filters
  const filteredStaff = staffMembers.filter((staff) => {
    // Search filter
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase();
    
    // Status filter
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    
    // Availability filter
    const matchesAvailability = 
      availabilityFilter === "all" || 
      (availabilityFilter === "today" && staff.availableToday) ||
      (availabilityFilter === "tomorrow" && staff.availableTomorrow);
    
    // Compliance filter
    const matchesCompliance = 
      complianceFilter === "all" || 
      (complianceFilter === "compliant" && staff.compliant) ||
      (complianceFilter === "non-compliant" && !staff.compliant);
    
    return matchesSearch && matchesRole && matchesStatus && matchesAvailability && matchesCompliance;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <Button className="bg-hss-purple-vivid hover:bg-hss-purple-vivid/90">
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>

        <Tabs defaultValue="grid" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search staff by name, role, department..."
                  className="pl-8 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 gap-1 bg-background"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px] h-10 bg-background">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10 bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-[140px] h-10 bg-background">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Availability</SelectItem>
                    <SelectItem value="today">Available Today</SelectItem>
                    <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                  <SelectTrigger className="w-[140px] h-10 bg-background">
                    <SelectValue placeholder="Compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Compliance</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non-compliant">Review Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <TabsList className="bg-muted/50 border border-border/50">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <StaffCard key={staff.id} staff={staff} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No staff found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="rounded-md border">
              <div className="flex flex-col">
                <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-2">Staff Member</div>
                  <div>Department</div>
                  <div>Shift</div>
                  <div>Availability</div>
                  <div>Compliance</div>
                </div>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <div key={staff.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="col-span-2 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback>{staff.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                      </div>
                      <div>{staff.department}</div>
                      <div>{staff.shift}</div>
                      <div>
                        {staff.availableToday ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-500">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <div>
                        {staff.compliant ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Compliant
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Review Needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No staff found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Staff;
