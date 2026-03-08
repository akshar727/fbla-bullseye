"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingButton } from "@/components/ui/loading-button";

type Participant = { id: string; name: string; email: string };

type ExchangeRoom = {
  id: number;
  proposed_time: string | null;
  time_accepted: string | null;
  created_at: string;
  user1: Participant;
  user2: Participant;
  claim: {
    id: number;
    claimed_item: { id: string; name: string };
  };
};

export default function AdminExchangesPage() {
  const [rooms, setRooms] = useState<ExchangeRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    `${number}-${"approve" | "deny"}` | null
  >(null);

  useEffect(() => {
    fetch("/api/admin/exchanges")
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load exchange requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (roomId: number, action: "approve" | "deny") => {
    setActionLoading(`${roomId}-${action}`);
    try {
      const res = await fetch("/api/admin/exchanges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? `Failed to ${action} exchange.`);
      } else {
        toast.success(
          action === "approve"
            ? "Exchange time approved!"
            : "Exchange time denied and cleared.",
        );
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? action === "approve"
                ? { ...r, time_accepted: new Date().toISOString() }
                : { ...r, proposed_time: null, time_accepted: null }
              : r,
          ),
        );
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = rooms.filter((r) => !r.time_accepted);
  const approved = rooms.filter((r) => !!r.time_accepted);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Exchange Requests</h1>
        <p className="text-muted-foreground text-sm">
          Review proposed meetup times between finders and claimants.
        </p>
      </div>

      {/* Pending */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Clock className="size-4 text-yellow-500" />
          Pending ({loading ? "…" : pending.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending exchange requests.
          </p>
        ) : (
          pending.map((room) => (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base">
                      {room.claim?.claimed_item?.name ?? "Unknown item"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Between{" "}
                      <span className="font-medium text-foreground">
                        {room.user1.name}
                      </span>{" "}
                      &amp;{" "}
                      <span className="font-medium text-foreground">
                        {room.user2.name}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm rounded-md border px-3 py-2 bg-muted/40">
                  <CalendarClock className="size-4 text-muted-foreground shrink-0" />
                  <span>
                    Proposed:{" "}
                    <span className="font-medium">
                      {room.proposed_time
                        ? format(
                            new Date(room.proposed_time),
                            "EEEE, MMM d 'at' h:mm a",
                          )
                        : "—"}
                    </span>
                  </span>
                </div>
                {room.time_accepted && (
                  <p className="text-xs text-muted-foreground">
                    Approved:{" "}
                    {format(
                      new Date(room.time_accepted),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <LoadingButton
                    size="sm"
                    variant="destructive"
                    loading={actionLoading === `${room.id}-deny`}
                    disabled={!!actionLoading}
                    onClick={() => handleAction(room.id, "deny")}
                  >
                    Deny
                  </LoadingButton>
                  <LoadingButton
                    size="sm"
                    loading={actionLoading === `${room.id}-approve`}
                    disabled={!!actionLoading}
                    onClick={() => handleAction(room.id, "approve")}
                  >
                    Approve
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approved */}
      {!loading && approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-500" />
            Approved ({approved.length})
          </h2>
          {approved.map((room) => (
            <Card key={room.id} className="opacity-75">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base">
                      {room.claim?.claimed_item?.name ?? "Unknown item"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Between{" "}
                      <span className="font-medium text-foreground">
                        {room.user1.name}
                      </span>{" "}
                      &amp;{" "}
                      <span className="font-medium text-foreground">
                        {room.user2.name}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  >
                    ✓ Approved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm rounded-md border px-3 py-2 bg-muted/40">
                  <CalendarClock className="size-4 text-muted-foreground shrink-0" />
                  <span>
                    Exchange set for:{" "}
                    <span className="font-medium">
                      {room.proposed_time
                        ? format(
                            new Date(room.proposed_time),
                            "EEEE, MMM d 'at' h:mm a",
                          )
                        : "—"}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
