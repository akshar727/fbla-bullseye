"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCog, Trash2, Bell, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

type AccountData = {
  firstName: string;
  lastName: string;
  send_email_notifs: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const { user, u_loading, refetch } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sendEmailNotifs, setSendEmailNotifs] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  // Fetch current account data
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/account")
      .then((r) => r.json())
      .then((data: AccountData) => {
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setSendEmailNotifs(data.send_email_notifs ?? false);
      })
      .catch(() => toast.error("Failed to load account data."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error("First name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          send_email_notifs: sendEmailNotifs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to save changes.");
      } else {
        toast.success("Account updated successfully.");
        window.location.reload();
      }
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to delete account.");
      } else {
        toast.success("Your account has been deleted.");
        window.location.href = "/";
      }
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (u_loading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-12 px-4">
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2">
              <UserCog aria-hidden="true" className="size-6 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold">Account Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile and preferences
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  disabled
                  className="text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell aria-hidden="true" className="size-4" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose whether to receive email notifications for claims,
                inquiries, and updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive emails for new claims, inquiry responses, and
                    approvals.
                  </p>
                </div>
                <Switch
                  aria-label="Toggle email notifications"
                  checked={sendEmailNotifs}
                  onCheckedChange={setSendEmailNotifs}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <LoadingButton loading={saving} onClick={handleSave}>
              Save Changes
            </LoadingButton>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3 pb-4">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert aria-hidden="true" className="size-4" />
              <p className="text-sm font-semibold">Delete Account</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete My Account
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? All your
              data — including reported items, claims, chats, and inquiries —
              will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Yes, Delete My Account
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
