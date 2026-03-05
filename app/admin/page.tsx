import {
  Users,
  Package,
  FileCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    description: "from last month",
    icon: Users,
  },
  {
    title: "Total Items",
    value: "1,234",
    change: "+8.2%",
    trend: "up" as const,
    description: "from last month",
    icon: Package,
  },
  {
    title: "Active Claims",
    value: "189",
    change: "-3.1%",
    trend: "down" as const,
    description: "from last month",
    icon: FileCheck,
  },
  {
    title: "Spam Blocked",
    value: "47",
    change: "+24.0%",
    trend: "up" as const,
    description: "flagged this month",
    icon: ShieldAlert,
  },
];

const recentActivity = [
  {
    action: "New item uploaded",
    detail: "Blue Thermos found at Main Library",
    time: "2 min ago",
  },
  {
    action: "Claim approved",
    detail: "Pink Purse claimed by user #1042",
    time: "15 min ago",
  },
  {
    action: "Spam blocked",
    detail: "AI flagged suspicious listing",
    time: "1 hr ago",
  },
  {
    action: "New user registered",
    detail: "jane.smith@email.com",
    time: "2 hr ago",
  },
  {
    action: "Item returned",
    detail: "Laptop matched and returned to owner",
    time: "3 hr ago",
  },
];

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your Bullseye platform activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-emerald-600"
                      : "text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-sans">Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium font-sans">
                    {item.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
