"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

const claimFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  schoolEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "School email is required"),
  uniqueIdentifiers: z
    .string()
    .min(
      10,
      "Please provide detailed unique identifiers (minimum 10 characters)",
    ),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

export default function ClaimItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { user, u_loading } = useUser();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemId, setItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proof-of-ownership images state
  const [proofImages, setProofImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
  });

  useEffect(() => {
    params.then((p) => setItemId(p.itemId));
  }, [params]);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Error fetching item:", error);
        else setItem(data);
        setLoading(false);
      });
  }, [itemId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setProofImages((prev) => [
        ...prev,
        ...incoming.filter(
          (f) => !prev.some((ex) => ex.name === f.name && ex.size === f.size),
        ),
      ]);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: ClaimFormValues) => {
    if (!itemId) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("itemId", itemId);
      fd.append(
        "extraDescriptions",
        `${values.firstName} ${values.lastName} <${values.schoolEmail}>\n${values.uniqueIdentifiers}`,
      );
      for (const img of proofImages) {
        fd.append("proof_images", img);
      }

      const res = await fetch("/api/claims", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error ?? "Failed to submit claim.");
      } else {
        toast.success("Claim submitted successfully!");
        router.push(`/item/${itemId}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (u_loading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-4 py-12">
      <h1 className="text-3xl font-black">Claim This Item</h1>
      <h2 className="text-lg font-medium text-gray-600">
        Please provide details to verify ownership. Our team reviews all claims
        within 24 hours to ensure items are returned to their rightful owners.
      </h2>
      <div className="flex gap-4 mt-4">
        {/* Item summary */}
        <div className="flex flex-1 flex-col gap-4">
          <Card className="flex-1 p-6">
            <CardTitle className="text-lg font-bold mb-4">
              Item Summary
            </CardTitle>
            <CardContent className="flex flex-col gap-2">
              {item?.image_urls?.[0] ? (
                <img
                  src={item.image_urls[0]}
                  alt={item.name}
                  className="h-55 w-full object-cover rounded-md"
                />
              ) : (
                <Skeleton className="h-55 w-full" />
              )}
              <div>
                <p className="text-xl font-black">{item?.name}</p>
                <p className="text-md font-medium text-gray-400">
                  {item?.last_location}
                </p>
                <p className="text-md font-medium text-gray-400">
                  {item?.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claim form */}
        <div className="flex-2">
          <Card className="p-6">
            <CardTitle className="text-lg font-bold mb-4">
              Claimant Details
            </CardTitle>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      {...register("firstName")}
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      {...register("lastName")}
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">School Email Address</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    placeholder="your.name@school.edu"
                    {...register("schoolEmail")}
                    aria-invalid={!!errors.schoolEmail}
                  />
                  {errors.schoolEmail && (
                    <p className="text-sm text-red-500">
                      {errors.schoolEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueIdentifiers">
                    Unique Identifiers (Not in Photo)
                  </Label>
                  <Textarea
                    id="uniqueIdentifiers"
                    placeholder="Describe unique features, scratches, marks, serial numbers, or other identifying details not visible in the photo..."
                    {...register("uniqueIdentifiers")}
                    aria-invalid={!!errors.uniqueIdentifiers}
                    rows={4}
                  />
                  {errors.uniqueIdentifiers && (
                    <p className="text-sm text-red-500">
                      {errors.uniqueIdentifiers.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Proof of Ownership (Optional)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {proofImages.length === 0
                      ? "Choose files…"
                      : `${proofImages.length} file${proofImages.length !== 1 ? "s" : ""} selected — add more`}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Upload a receipt, purchase confirmation, or photo of you
                    with the item (Max 5MB each)
                  </p>
                  {proofImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {proofImages.map((file, i) => (
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    type="submit"
                    className="flex-1"
                    loading={isSubmitting}
                  >
                    Submit Claim
                  </LoadingButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
