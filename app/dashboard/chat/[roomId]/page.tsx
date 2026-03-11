"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";

type Participant = { id: string; name: string };

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender: Participant;
};

type Room = {
  id: string;
  proposed_time: string | null;
  time_accepted: string | null;
  user1: Participant;
  user2: Participant;
  claim: {
    id: string;
    time_accepted: string | null;
    claimed_item: { id: string; name: string };
  };
};

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user, u_loading } = useUser();
  const supabase = createClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Propose time dialog
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeDate, setProposeDate] = useState<Date | undefined>(undefined);
  const [proposeTime, setProposeTime] = useState("12:00");
  const [proposeLoading, setProposeLoading] = useState(false);

  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  // Initial load
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/chat/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) {
          toast.error(data.error);
          return;
        }
        setRoom(data.room);
        setMessages(data.messages ?? []);
      })
      .catch(() => toast.error("Failed to load chat."))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the full message row with sender join
          const { data } = await supabase
            .from("messages")
            .select(
              "id, content, created_at, sender:users!messages_sender_fkey (id, name)",
            )
            .eq("id", payload.new.id)
            .single();
          if (data) {
            const msg = data as unknown as Message;
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to send message.");
        setInput(content); // restore input on failure
      } else {
        setMessages((prev) =>
          prev.some((m) => m.id === data.id)
            ? prev
            : [...prev, data as unknown as Message],
        );
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleProposeTime = async () => {
    if (!proposeDate || !proposeTime) return;
    const day = proposeDate.getDay();
    if (day === 0 || day === 6) {
      toast.error("Please select a weekday (Mon–Fri).");
      return;
    }
    const [hours, minutes] = proposeTime.split(":").map(Number);
    const totalMins = hours * 60 + minutes;
    if (totalMins < 7 * 60 + 15 || totalMins > 13 * 60 + 45) {
      toast.error("Time must be between 7:15 AM and 1:45 PM.");
      return;
    }
    setProposeLoading(true);
    try {
      const [hours, minutes] = proposeTime.split(":").map(Number);
      const combined = new Date(proposeDate);
      combined.setHours(hours, minutes, 0, 0);
      const iso = combined.toISOString();

      const res = await fetch(`/api/chat/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposed_time: iso }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to propose time.");
      } else {
        toast.success("Meetup time proposed!");
        setRoom((prev) =>
          prev ? { ...prev, proposed_time: iso, time_accepted: null } : prev,
        );
        setProposeOpen(false);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setProposeLoading(false);
    }
  };

  function formatDateTime(t: string) {
    return format(new Date(t), "MMM d 'at' h:mm a");
  }

  const other =
    room && user ? (room.user1.id === user.id ? room.user2 : room.user1) : null;

  if (loading || u_loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] max-w-2xl mx-auto p-4 gap-3">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex-1 space-y-3 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-10 w-2/3 ${i % 2 === 0 ? "" : "ml-auto"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <p>Chat room not found or you don't have access.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-semibold text-base">
            Chat with {other?.name ?? "—"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Re: {room.claim.claimed_item.name}
          </p>

          {room.claim.time_accepted && (
            <Badge variant="secondary" className="mt-1 text-xs gap-1 w-fit">
              ✓ Approved by admin: {formatDateTime(room.claim.time_accepted)}
            </Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          {room.proposed_time && (
            <div
              className={`flex items-center gap-1.5 text-xs border rounded-md px-2 py-1 ${
                room.time_accepted
                  ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                  : "text-muted-foreground"
              }`}
            >
              <Clock className="size-3 shrink-0" />
              {room.time_accepted
                ? "✓ Meetup confirmed:"
                : "Meetup proposed:"}{" "}
              {formatDateTime(room.proposed_time)}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => setProposeOpen(true)}
          >
            <CalendarIcon className="size-3.5 mr-1.5" />
            Propose Time
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <p>
          Use this chat to communicate with {other?.name ?? "the other person"}{" "}
          and coordinate a time to meet at the{" "}
          <strong className="text-foreground">Front Office</strong> to exchange
          the item in front of an admin.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground pt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-muted-foreground px-1">
                {isMe ? "You" : msg.sender.name}
              </span>
              <div
                className={`max-w-xs sm:max-w-sm rounded-2xl px-3.5 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {format(new Date(msg.created_at), "h:mm a")}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2 shrink-0">
        <Input
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>

      {/* Propose time dialog */}
      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Propose a Meetup Time</DialogTitle>
            <DialogDescription>
              Pick a time of day to meet up and exchange the item.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !proposeDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {proposeDate ? format(proposeDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={proposeDate}
                  onSelect={setProposeDate}
                  disabled={(date) => {
                    const day = date.getDay();
                    return (
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      day === 0 ||
                      day === 6
                    );
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              min="07:15"
              max="13:45"
              value={proposeTime}
              onChange={(e) => setProposeTime(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProposeOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              loading={proposeLoading}
              disabled={!proposeDate || !proposeTime}
              onClick={handleProposeTime}
            >
              Propose
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
