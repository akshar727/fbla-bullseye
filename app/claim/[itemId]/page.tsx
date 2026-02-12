"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const claimFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  schoolEmail: z
    .email("Invalid email address")
    .min(1, "School email is required"),
  uniqueIdentifiers: z
    .string()
    .min(
      10,
      "Please provide detailed unique identifiers (minimum 10 characters)",
    ),
  proofOfOwnership: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB",
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .pdf formats are supported",
    ),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

export default function ClaimItemPage({
  params,
}: {
  params: { itemId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
  });

  return (
    <>
      <Button
        onClick={() => {
          supabase.auth.signInWithOAuth({
            provider: "google",
          });
        }}
      >
        test
      </Button>
      <div className="px-4 py-12">
        <h1 className="text-3xl font-black">Claim This Item</h1>
        <h2 className="text-lg font-medium text-gray-600">
          Please provide details to verify ownership. Our team reviews all
          claims within 24 hours to ensure items are returned to their rightful
          owners.
        </h2>
        <div className="flex gap-4 mt-4">
          <div className="flex flex-1 flex-col gap-4">
            <Card className="flex-1 p-6">
              <CardTitle className="text-lg font-bold mb-4">
                Item Summary
              </CardTitle>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-55 w-full"></Skeleton>
                <div>
                  <p className="text-xl font-black">Item Name</p>
                  <p className="text-md font-medium text-gray-400">
                    Item Location
                  </p>
                  <p className="text-md font-medium text-gray-400">
                    Item Description
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-2">
            <Card className="p-6">
              <CardTitle className="text-lg font-bold mb-4">
                Claimant Details
              </CardTitle>
              <CardContent>
                <form
                  /*onSubmit={handleSubmit(onSubmit)}*/ className="space-y-4"
                >
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
                    <Label htmlFor="proofOfOwnership">
                      Proof of Ownership (Optional)
                    </Label>
                    <Input
                      id="proofOfOwnership"
                      type="file"
                      accept="image/*,.pdf"
                      {...register("proofOfOwnership")}
                      aria-invalid={!!errors.proofOfOwnership}
                    />
                    <p className="text-xs text-gray-500">
                      Upload a receipt, purchase confirmation, or photo of you
                      with the item (Max 5MB)
                    </p>
                    {errors.proofOfOwnership && (
                      <p className="text-sm text-red-500">
                        {errors.proofOfOwnership.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      // onClick={handleCancel}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Claim"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
