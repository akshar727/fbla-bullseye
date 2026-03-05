"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Recaptcha } from "@/components/ui/recaptcha";
import { verifyCaptcha } from "@/lib/captcha";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

const claimFormSchema = z.object({
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
  const { user, u_loading } = useUser();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemId, setItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Proof-of-ownership images state
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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
    fetch(`/api/item/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) console.error("Error fetching item:", data.error);
        else setItem(data);
      })
      .catch((err) => console.error("Error fetching item:", err))
      .finally(() => setLoading(false));
  }, [itemId]);

  // Auth check handled in render below

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
    // if (proofImages.length === 0) {
    //   toast.error("Please upload at least one proof of ownership.");
    //   return;
    // }
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setIsSubmitting(true);
    try {
      // Verify CAPTCHA first
      const verified = await verifyCaptcha(captchaToken);

      if (!verified) {
        toast.error("CAPTCHA verification failed. Please try again.");
        setCaptchaToken(null);
        return;
      }

      const fd = new FormData();
      fd.append("itemId", itemId);
      fd.append("extraDescriptions", values.uniqueIdentifiers);
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

  // Change redirect to show a login prompt instead
  if (!u_loading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <p className="text-2xl font-bold">You need to be logged in</p>
        <p className="text-muted-foreground">
          Please sign in before submitting a claim.
        </p>
        <Button onClick={() => router.push("/")}>Go to Login</Button>
      </div>
    );
  }

  if (u_loading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <h1 className="text-3xl font-black">Claim This Item</h1>
      <h2 className="text-lg font-medium text-gray-600">
        Please provide details to verify ownership. Our team reviews all claims
        within 24 hours to ensure items are returned to their rightful owners.
      </h2>
      <div className="flex gap-4 mt-4 items-stretch">
        {/* Item summary */}
        <div className="flex flex-1 flex-col gap-4">
          <Card className="flex-1 p-6">
            <CardTitle className="text-lg font-bold mb-4">
              Item Summary
            </CardTitle>
            <CardContent className="flex flex-col gap-2">
              {item?.image_urls?.length > 0 ? (
                <div className="space-y-2">
                  <img
                    src={item.image_urls[activeImage]}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-md border"
                  />
                  {item.image_urls.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {item.image_urls.map((url: string, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`w-14 h-14 rounded-md border-2 overflow-hidden transition-all ${
                            i === activeImage
                              ? "border-primary"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-square rounded-md border bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  No images
                </div>
              )}
              <div>
                <p>
                  Posted by:{" "}
                  <span className="text-foreground">
                    {(item.posted_by as any)?.name ?? "someone"}
                  </span>
                </p>
                <p className="text-xl font-black">{item?.name}</p>
                <p className="text-md font-medium">
                  Last Location: {item?.last_location}
                </p>
                <p className="text-md font-medium">{item?.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claim form */}
        <div className="flex-2 flex flex-col">
          <Card className="p-6 flex-1 flex flex-col">
            <CardTitle className="text-lg font-bold mb-4">
              Claimant Details
            </CardTitle>
            <CardContent className="flex-1 flex flex-col">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col flex-1 gap-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="uniqueIdentifiers">
                    Unique Identifiers (Not in Photo){" "}
                    <span className="text-red-500">*</span>
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
                  <Label>Proof of Ownership</Label>
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

                <div className="flex justify-center scale-90 origin-top -my-3">
                  <Recaptcha onVerify={setCaptchaToken} />
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.back()}
                  >
                    Go Back
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
