
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileCheck,
  Filter,
  Upload,
  Plus,
  ExternalLink,
  FileText,
  AlertCircle
} from "lucide-react";

// Sample data
const complianceItems = [
  {
    id: 1,
    name: "Dr. Emily Johnson",
    role: "Doctor",
    department: "Cardiology",
    certification: "Medical License",
    expiryDate: "2025-06-15",
    status: "valid", // valid, expiring, expired
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Michael Smith",
    role: "Nurse",
    department: "Emergency",
    certification: "RN License",
    expiryDate: "2023-05-20",
    status: "expired",
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Sarah Wilson",
    role: "Technician",
    department: "Radiology",
    certification: "RT License",
    expiryDate: "2024-08-10",
    status: "valid",
    renewalReminder: false,
    avatar: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Lisa Thompson",
    role: "Nurse",
    department: "Pediatrics",
    certification: "BLS Certification",
    expiryDate: "2023-11-30",
    status: "expiring",
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Robert Chen",
    role: "Technician",
    department: "Laboratory",
    certification: "MLT License",
    expiryDate: "2024-03-15",
    status: "valid",
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
  {
    id: 6,
    name: "James Rodriguez",
    role: "Doctor",
    department: "Neurology",
    certification: "DEA License",
    expiryDate: "2023-12-05",
    status: "expiring",
    renewalReminder: false,
    avatar: "/placeholder.svg",
  },
  {
    id: 7,
    name: "Olivia Martinez",
    role: "Doctor",
    department: "Oncology",
    certification: "Board Certification",
    expiryDate: "2026-01-20",
    status: "valid",
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
  {
    id: 8,
    name: "Daniel Lewis",
    role: "Cleaner",
    department: "Housekeeping",
    certification: "OSHA Training",
    expiryDate: "2023-09-10",
    status: "expired",
    renewalReminder: true,
    avatar: "/placeholder.svg",
  },
];

const Compliance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [certificationFilter, setCertificationFilter] = useState("all");

  // Calculate stats
  const totalItems = complianceItems.length;
  const validItems = complianceItems.filter(item => item.status === "valid").length;
  const expiringItems = complianceItems.filter(item => item.status === "expiring").length;
  const expiredItems = complianceItems.filter(item => item.status === "expired").length;

  const validPercentage = Math.round((validItems / totalItems) * 100);
  const expiringPercentage = Math.round((expiringItems / totalItems) * 100);
  const expiredPercentage = Math.round((expiredItems / totalItems) * 100);

  // Filter items based on search and filters
  const filteredItems = complianceItems.filter((item) => {
    // Search filter
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certification.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      item.status === statusFilter;
    
    // Department filter
    const matchesDepartment = 
      departmentFilter === "all" || 
      item.department.toLowerCase() === departmentFilter.toLowerCase();
    
    // Certification filter
    const matchesCertification = 
      certificationFilter === "all" || 
      item.certification.toLowerCase().includes(certificationFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesCertification;
  });

  // Get unique departments for filter
  const departments = [...new Set(complianceItems.map(item => item.department))];
  
  // Get unique certifications for filter
  const certifications = [...new Set(complianceItems.map(item => item.certification))];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
            <p className="text-muted-foreground">Monitor certifications and documentation</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-hss-purple-vivid hover:bg-hss-purple-vivid/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Compliance Document</DialogTitle>
                <DialogDescription>
                  Upload a new certification or documentation for staff member.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceItems.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="id">ID/Credential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="expiry-date">
                    Expiry Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2023, 2024, 2025, 2026, 2027].map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Document</label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Drag and drop your file here</p>
                    <p className="text-xs text-muted-foreground mb-2">or</p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" className="bg-hss-purple-vivid hover:bg-hss-purple-vivid/90">
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 animate-slide-in-bottom [animation-delay:100ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{validPercentage}%</div>
              <Progress value={validPercentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {validItems} of {totalItems} items valid
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 animate-slide-in-bottom [animation-delay:200ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Valid Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-500">{validItems}</div>
                <Badge variant="outline" className="border-green-500 text-green-500">
                  Active
                </Badge>
              </div>
              <Progress value={100} className="h-2 mt-2 bg-muted/50" />
            </CardContent>
          </Card>
          
          <Card className="border-border/50 animate-slide-in-bottom [animation-delay:300ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-amber-500">{expiringItems}</div>
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  Warning
                </Badge>
              </div>
              <Progress value={100} className="h-2 mt-2 bg-muted/50" />
            </CardContent>
          </Card>
          
          <Card className="border-border/50 animate-slide-in-bottom [animation-delay:400ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-500">{expiredItems}</div>
                <Badge variant="outline" className="border-red-500 text-red-500">
                  Urgent
                </Badge>
              </div>
              <Progress value={100} className="h-2 mt-2 bg-muted/50" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-border/50 animate-scale-in">
          <CardHeader>
            <CardTitle>Compliance Management</CardTitle>
            <CardDescription>
              Track all staff certifications, licenses, and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name, role, certification..."
                    className="pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10 bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="expiring">Expiring</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[160px] h-10 bg-background">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept, i) => (
                        <SelectItem key={i} value={dept.toLowerCase()}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={certificationFilter} onValueChange={setCertificationFilter}>
                    <SelectTrigger className="w-[180px] h-10 bg-background">
                      <SelectValue placeholder="Certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Certifications</SelectItem>
                      {certifications.map((cert, i) => (
                        <SelectItem key={i} value={cert.toLowerCase()}>
                          {cert}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Compliance Items */}
              <Tabs defaultValue="all" className="mt-2">
                <TabsList className="bg-muted/50 border border-border/50">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="valid">Valid</TabsTrigger>
                  <TabsTrigger value="expiring">Expiring</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  {filteredItems.length > 0 ? (
                    <div className="rounded-md border border-border/50 overflow-hidden">
                      <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                        <div className="col-span-2">Staff Member</div>
                        <div>Department</div>
                        <div>Document</div>
                        <div>Expiry Date</div>
                        <div>Status</div>
                      </div>
                      {filteredItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-muted/10">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback>{item.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.role}</div>
                            </div>
                          </div>
                          <div>{item.department}</div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-hss-purple-vivid" />
                            <span>{item.certification}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            {item.status === "valid" && (
                              <Badge className="bg-green-500">Valid</Badge>
                            )}
                            {item.status === "expiring" && (
                              <Badge className="bg-amber-500">Expiring Soon</Badge>
                            )}
                            {item.status === "expired" && (
                              <Badge className="bg-red-500">Expired</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No documents found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="valid" className="mt-4">
                  {filteredItems.filter(i => i.status === "valid").length > 0 ? (
                    <div className="rounded-md border border-border/50 overflow-hidden">
                      <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                        <div className="col-span-2">Staff Member</div>
                        <div>Department</div>
                        <div>Document</div>
                        <div>Expiry Date</div>
                        <div>Status</div>
                      </div>
                      {filteredItems.filter(i => i.status === "valid").map((item) => (
                        <div key={item.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-muted/10">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback>{item.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.role}</div>
                            </div>
                          </div>
                          <div>{item.department}</div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-hss-purple-vivid" />
                            <span>{item.certification}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <Badge className="bg-green-500">Valid</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No valid documents found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="expiring" className="mt-4">
                  {filteredItems.filter(i => i.status === "expiring").length > 0 ? (
                    <div className="rounded-md border border-border/50 overflow-hidden">
                      <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                        <div className="col-span-2">Staff Member</div>
                        <div>Department</div>
                        <div>Document</div>
                        <div>Expiry Date</div>
                        <div>Status</div>
                      </div>
                      {filteredItems.filter(i => i.status === "expiring").map((item) => (
                        <div key={item.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-muted/10">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback>{item.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.role}</div>
                            </div>
                          </div>
                          <div>{item.department}</div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-hss-purple-vivid" />
                            <span>{item.certification}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <Badge className="bg-amber-500">Expiring Soon</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No expiring documents found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="expired" className="mt-4">
                  {filteredItems.filter(i => i.status === "expired").length > 0 ? (
                    <div className="rounded-md border border-border/50 overflow-hidden">
                      <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                        <div className="col-span-2">Staff Member</div>
                        <div>Department</div>
                        <div>Document</div>
                        <div>Expiry Date</div>
                        <div>Status</div>
                      </div>
                      {filteredItems.filter(i => i.status === "expired").map((item) => (
                        <div key={item.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-muted/10">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback>{item.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.role}</div>
                            </div>
                          </div>
                          <div>{item.department}</div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-hss-purple-vivid" />
                            <span>{item.certification}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <Badge className="bg-red-500">Expired</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <XCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No expired documents found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Expirations */}
        <Card className="border-border/50 animate-slide-in-bottom">
          <CardHeader>
            <CardTitle>Upcoming Expirations</CardTitle>
            <CardDescription>Documents expiring in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">License Expiring in 10 Days</h3>
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        10 days left
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dr. James Rodriguez's DEA License expires on December 5, 2023
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View Document
                      </Button>
                      <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Certification Expiring in 15 Days</h3>
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        15 days left
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Lisa Thompson's BLS Certification expires on November 30, 2023
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View Document
                      </Button>
                      <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Compliance;
