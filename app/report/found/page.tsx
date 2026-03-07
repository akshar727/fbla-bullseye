"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import { CATEGORY_KEYS, CATEGORY_MAP } from "@/lib/categories";
import { toast } from "sonner";
import Footer from "@/components/footer";

export default function LostPage() {
  const { user, u_loading } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    dateTimeLost: "",
    images: [] as File[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!u_loading && !user) {
      router.replace("/");
    }
  }, [u_loading, user, router]);

  if (u_loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build multipart payload — images are uploaded server-side
      const fd = new FormData();
      fd.append("name", formData.itemName);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("last_location", formData.location);
      fd.append("date_lost", formData.dateTimeLost);
      for (const image of formData.images) {
        fd.append("images", image);
      }

      const response = await fetch("/api/items", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error ?? "Failed to submit found item report.");
      } else {
        toast.success("Found item report submitted!");
        router.push(`/item/${data.id}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
    // Always clear the native input — our preview grid is the source of truth
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      // Dedupe against already-selected files by name + size
      const existing = formData.images;
      const merged = [
        ...existing,
        ...incoming.filter(
          (f) =>
            !existing.some((ex) => ex.name === f.name && ex.size === f.size),
        ),
      ];
      setFormData({ ...formData, images: merged });
      // Reset the input so the picker always shows "No file chosen" and the
      // same file can be re-added after being removed
      e.target.value = "";
    }
  };
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Report a Found Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Blue backpack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full" id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CATEGORY_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {CATEGORY_MAP[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide detailed description of the lost item"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Found *</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Cafeteria, Room 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTimeLost">Date & Time Found *</Label>
                <Input
                  type="datetime-local"
                  id="dateTimeLost"
                  name="dateTimeLost"
                  value={formData.dateTimeLost}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Upload Images (Optional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.images.length === 0
                    ? "Choose images…"
                    : `${formData.images.length} image${formData.images.length !== 1 ? "s" : ""}`}
                </Button>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((file, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${file.name}`}
                        >
                          ✕
                        </button>
                        <p className="text-xs text-muted-foreground truncate mt-1 px-0.5">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <LoadingButton
                type="submit"
                className="w-full"
                loading={isSubmitting}
              >
                Submit Found Item Report
              </LoadingButton>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
