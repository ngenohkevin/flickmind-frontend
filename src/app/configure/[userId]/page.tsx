"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfigForm } from "@/components/config-form";
import { getConfig, type UserConfig } from "@/lib/api";

export default function ConfigureUserPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;

  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (searchParams.get("trakt") === "connected") {
      toast.success("Trakt.tv connected successfully!");
    }
  }, [searchParams]);

  useEffect(() => {
    getConfig(userId)
      .then(setConfig)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error || !config) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">User not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            FlickMind
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your preferences — changes apply on next catalog refresh
          </p>
        </div>
        <ConfigForm existingConfig={config} userId={userId} />
      </div>
    </main>
  );
}
