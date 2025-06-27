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
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react";

const notifications = [
  {
    title: "New Staff Registered",
    description: "A new nurse has registered and is awaiting approval.",
    status: "Pending",
    icon: <Bell className="h-4 w-4" />,
    color: "text-yellow-500 border-yellow-500",
  },
  {
    title: "Shift Coverage Gap",
    description:
      "There is a shift without assigned staff for the evening rotation.",
    status: "Urgent",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-red-500 border-red-500",
  },
  {
    title: "System Update",
    description: "Version 2.1 of HSS was deployed successfully.",
    status: "Info",
    icon: <Info className="h-4 w-4" />,
    color: "text-blue-500 border-blue-500",
  },
  {
    title: "Compliance Completed",
    description: "All 24 staff completed the annual safety training.",
    status: "Complete",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-500 border-green-500",
  },
  {
    title: "Upcoming Shift",
    description: "Dr. Wilson has a shift scheduled at 10 PM tonight.",
    status: "Scheduled",
    icon: <Clock className="h-4 w-4" />,
    color: "text-purple-500 border-purple-500",
  },
];

const Notifications = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <Badge className="bg-hss-purple-vivid">System Feed</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notifications.map((note, idx) => (
            <Card
              key={idx}
              className={`border border-border/40 shadow-md backdrop-blur-lg bg-background/80 transition hover:shadow-xl hover:scale-[1.01] hover:border-primary/50`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full border ${note.color}`}>
                  {note.icon}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                    {note.title}
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs ${note.color}`}>
                    {note.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-black pt-0 px-6 pb-4">
                {note.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
