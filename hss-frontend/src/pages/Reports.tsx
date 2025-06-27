import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BarChart2,
  ShieldCheck,
  Activity,
  Users,
} from "lucide-react";

const reports = [
  {
    title: "Staff Activity Report",
    description: "View individual staff performance and logged hours.",
    icon: <Users className="h-5 w-5 text-hss-purple-vivid" />,
    badge: "HR",
  },
  {
    title: "Compliance Audit",
    description:
      "Check certification compliance rates across departments.",
    icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
    badge: "Compliance",
  },
  {
    title: "Shift Analytics",
    description: "Daily and weekly breakdown of scheduled shifts.",
    icon: <BarChart2 className="h-5 w-5 text-blue-500" />,
    badge: "Analytics",
  },
  {
    title: "Incident Logs",
    description: "Review past alerts and critical event records.",
    icon: <Activity className="h-5 w-5 text-red-500" />,
    badge: "Alerts",
  },
  {
    title: "Hospital Overview",
    description:
      "Get a summary report of overall system activity and KPIs.",
    icon: <FileText className="h-5 w-5 text-hss-blue-bright" />,
    badge: "System",
  },
];

const Reports = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <Badge className="bg-hss-purple-vivid">Admin Tools</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report, idx) => (
            <Card
              key={idx}
              className="border border-border/40 shadow-lg backdrop-blur-lg bg-background/80 hover:shadow-xl hover:scale-[1.015] transition-transform animate-slide-in-bottom [animation-delay:.2s]"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">{report.icon}</div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {report.badge}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 px-6 pb-4 text-sm text-black">
                <p className="opacity-75">Click to open full report</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
