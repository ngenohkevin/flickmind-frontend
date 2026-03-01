"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.svg"
            alt="FlickMind"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              FlickMind
            </h1>
            <p className="text-xs text-muted-foreground">
              Changes apply on next catalog refresh
            </p>
          </div>
        </div>
        <ConfigForm existingConfig={config} userId={userId} />
      </div>
    </main>
  );
}
