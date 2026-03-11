"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FixesPage() {
  const [itemId, setItemId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (!itemId.trim()) return setResult("Item ID is required.");
    if (files.length === 0) return setResult("Select at least one image.");

    setLoading(true);
    const fd = new FormData();
    fd.append("itemId", itemId.trim());
    for (const f of files) fd.append("images", f);

    try {
      const res = await fetch("/api/admin/fixes", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setResult(`Error: ${data.error}`);
      else {
        setResult(`Done — ${data.added} image(s) attached.`);
        setItemId("");
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setResult("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Fix Item Images</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images and attach them to an existing item by ID.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="itemId">Item ID</Label>
          <Input
            id="itemId"
            placeholder="e.g. 12"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="images">Images</Label>
          <input
            ref={fileInputRef}
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          {files.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Uploading…" : "Upload & Attach"}
        </Button>
      </form>

      {result && (
        <p
          className={`text-sm font-medium ${result.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
        >
          {result}
        </p>
      )}
    </div>
  );
}
