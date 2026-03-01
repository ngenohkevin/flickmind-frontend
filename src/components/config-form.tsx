"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  type UserConfig,
  type ConfigPayload,
  createConfig,
  updateConfig,
  disconnectTrakt,
  getTraktAuthURL,
  getAddonURL,
  getInstallURL,
} from "@/lib/api";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
];

const CONTENT_TYPES = [
  { value: "movie", label: "Movies" },
  { value: "series", label: "TV Shows" },
  { value: "anime", label: "Anime" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "", label: "Any" },
];

const MOODS = [
  { value: "", label: "No preference" },
  { value: "cozy", label: "Cozy" },
  { value: "thrilling", label: "Thrilling" },
  { value: "mind-bending", label: "Mind-bending" },
  { value: "feel-good", label: "Feel-good" },
  { value: "dark", label: "Dark" },
  { value: "romantic", label: "Romantic" },
  { value: "funny", label: "Funny" },
  { value: "epic", label: "Epic" },
  { value: "nostalgic", label: "Nostalgic" },
];

interface ConfigFormProps {
  existingConfig?: UserConfig;
  userId?: string;
}

export function ConfigForm({ existingConfig, userId }: ConfigFormProps) {
  const router = useRouter();
  const isNew = !userId;

  const [groqKey, setGroqKey] = useState(existingConfig?.groqKey || "");
  const [deepseekKey, setDeepseekKey] = useState(
    existingConfig?.deepseekKey || ""
  );
  const [geminiKey, setGeminiKey] = useState(existingConfig?.geminiKey || "");
  const [genres, setGenres] = useState<string[]>(
    existingConfig?.genres || []
  );
  const [contentTypes, setContentTypes] = useState<string[]>(
    existingConfig?.contentTypes || ["movie", "series"]
  );
  const [language, setLanguage] = useState(existingConfig?.language || "en");
  const [mood, setMood] = useState(existingConfig?.mood || "");
  const [minRating, setMinRating] = useState(existingConfig?.minRating || 0);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleContentType = (type: string) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: ConfigPayload = {
      groqKey,
      deepseekKey,
      geminiKey,
      genres,
      contentTypes,
      language,
      mood,
      minRating,
    };

    try {
      if (isNew) {
        const result = await createConfig(payload);
        toast.success("Config saved! Redirecting...");
        router.push(`/configure/${result.userId}`);
      } else {
        await updateConfig(userId, payload);
        toast.success("Changes saved! Recommendations will update on next refresh.");
      }
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectTrakt = async () => {
    if (!userId || !confirm("Disconnect Trakt.tv?")) return;
    try {
      await disconnectTrakt(userId);
      toast.success("Trakt disconnected");
      router.refresh();
    } catch {
      toast.error("Failed to disconnect Trakt");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            AI API Keys
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Add at least one key for AI recommendations. Without keys, you get
            TMDB popular content.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groqKey">Groq API Key</Label>
            <Input
              id="groqKey"
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deepseekKey">DeepSeek API Key</Label>
            <Input
              id="deepseekKey"
              type="password"
              placeholder="sk-..."
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geminiKey">Gemini API Key</Label>
            <Input
              id="geminiKey"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trakt.tv */}
      {existingConfig?.hasTrakt && userId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Trakt.tv Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  existingConfig.traktConnected ? "bg-green-500" : "bg-zinc-500"
                }`}
              />
              <span className="text-sm">
                {existingConfig.traktConnected
                  ? "Connected"
                  : "Not connected"}
              </span>
            </div>
            {existingConfig.traktConnected ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDisconnectTrakt}
              >
                Disconnect Trakt
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" asChild>
                <a href={getTraktAuthURL(userId)}>Connect Trakt.tv</a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genres */}
          <div className="space-y-3">
            <Label>Preferred Genres</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={genres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-3">
            <Label>Content Types</Label>
            <div className="flex flex-wrap gap-4">
              {CONTENT_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={contentTypes.includes(value)}
                    onCheckedChange={() => toggleContentType(value)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <Label>Mood</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={mood === value ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  onClick={() => setMood(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Rating</Label>
              <span className="text-sm font-semibold text-violet-500">
                {minRating > 0 ? minRating.toFixed(1) : "Any"}
              </span>
            </div>
            <Slider
              value={[minRating]}
              onValueChange={([v]) => setMinRating(v)}
              min={0}
              max={9}
              step={0.5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-violet-600 hover:bg-violet-700"
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : isNew
          ? "Create & Get Addon URL"
          : "Save Changes"}
      </Button>

      {/* Addon URL (existing users) */}
      {userId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Addon URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="block text-xs text-cyan-500 bg-muted p-3 rounded-md break-all">
              {getAddonURL(userId)}
            </code>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => window.open(getInstallURL(userId), "_blank")}
            >
              Install in Stremio / Nuvio
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                navigator.clipboard.writeText(getAddonURL(userId));
                toast.success("Copied to clipboard");
              }}
            >
              Copy URL
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
