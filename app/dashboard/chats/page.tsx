"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquareText,
  Clock,
  Check,
  Badge as EmptyBadge,
  BadgeCheck,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

type Participant = { id: string; name: string };
type ChatRoom = {
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
  messages: { id: number; content: string; created_at: string }[];
};

function formatTime(t: string) {
  return format(new Date(t), "MMM d 'at' h:mm a");
}

export default function ChatsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function otherParticipant(room: ChatRoom) {
    if (!user) return null;
    return room.user1.id === user.id ? room.user2 : room.user1;
  }

  function latestMessage(room: ChatRoom) {
    if (!room.messages?.length) return null;
    return [...room.messages].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chats</h1>
        <p className="text-muted-foreground text-sm">
          Your active conversations with item finders / claimants.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <MessageSquareText className="h-10 w-10" />
            <p className="text-sm">No chats yet.</p>
            <p className="text-xs text-center max-w-xs">
              Chats open automatically when a claim is approved. Go to your
              dashboard to see approved items.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const other = otherParticipant(room);
            const latest = latestMessage(room);
            return (
              <Card
                key={room.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/dashboard/chat/${room.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {other?.name ?? "Unknown"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Re:{" "}
                        <span className="font-medium text-foreground">
                          {room.claim?.claimed_item?.name ?? "Unknown item"}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex flex-row gap-1">
                        {room.proposed_time && (
                          <Badge
                            variant="secondary"
                            className={`text-xs gap-1 ${
                              room.time_accepted
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : ""
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {room.time_accepted
                              ? "✓ Confirmed:"
                              : "Proposed:"}{" "}
                            {formatTime(room.proposed_time)}
                          </Badge>
                        )}
                        {room.time_accepted ? (
                          <Badge
                            variant="secondary"
                            className="text-xs gap-1 w-fit bg-green-100 text-green-700"
                          >
                            <BadgeCheck className="h-3 w-3" />
                            Approved by admin
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-yellow-100 text-yellow-700 gap-1 w-fit"
                          >
                            <EmptyBadge className="h-3 w-3" />
                            Pending admin approval
                          </Badge>
                        )}
                      </div>
                      {latest && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(latest.created_at), "MMM d, h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {latest && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {latest.content}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
