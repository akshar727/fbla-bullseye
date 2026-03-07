"use client";

import { useEffect, useState } from "react";
import { Users, Package, FileCheck, ShieldAlert, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneralStats {
  totalUsers: number;
  totalItems: number;
  activeClaims: number;
  spamBlocked: number;
  recentLogs: { header: string; message: string; created_at: string }[];
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminPage() {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/general")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
    },
    {
      title: "Total Items",
      value: stats?.totalItems,
      icon: Package,
    },
    {
      title: "Active Claims",
      value: stats?.activeClaims,
      icon: FileCheck,
    },
    {
      title: "Spam Blocked",
      value: stats?.spamBlocked,
      icon: ShieldAlert,
    },
  ];

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
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <div className="text-2xl font-bold font-sans">
                  {stat.value?.toLocaleString() ?? "—"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-sans flex items-center gap-2">
            <Activity className="size-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : !stats?.recentLogs?.length ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.recentLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium font-sans">
                      {log.header}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {log.message}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {timeAgo(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
