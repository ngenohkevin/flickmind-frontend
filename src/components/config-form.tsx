"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Zap,
  Brain,
  Sparkles,
  ExternalLink,
  Copy,
  Link2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const AI_PROVIDERS = [
  {
    id: "groq",
    name: "Groq",
    description: "Llama 3.3 70B — fast inference",
    placeholder: "gsk_...",
    icon: Zap,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek-V3 — high quality",
    placeholder: "sk-...",
    icon: Brain,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Gemini 2.0 Flash — Google AI",
    placeholder: "AIza...",
    icon: Sparkles,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
] as const;

type ProviderId = (typeof AI_PROVIDERS)[number]["id"];

interface ConfigFormProps {
  existingConfig?: UserConfig;
  userId?: string;
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  const isMasked = value.startsWith("••••");

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 font-mono text-xs"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {visible && !isMasked ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export function ConfigForm({ existingConfig, userId }: ConfigFormProps) {
  const router = useRouter();
  const isNew = !userId;

  const [keys, setKeys] = useState<Record<ProviderId, string>>({
    groq: existingConfig?.groqKey || "",
    deepseek: existingConfig?.deepseekKey || "",
    gemini: existingConfig?.geminiKey || "",
  });

  const [enabledProviders, setEnabledProviders] = useState<
    Record<ProviderId, boolean>
  >({
    groq: !!existingConfig?.groqKey,
    deepseek: !!existingConfig?.deepseekKey,
    gemini: !!existingConfig?.geminiKey,
  });

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
  const [copied, setCopied] = useState(false);

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

  const toggleProvider = (id: ProviderId) => {
    setEnabledProviders((prev) => ({ ...prev, [id]: !prev[id] }));
    if (enabledProviders[id]) {
      setKeys((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: ConfigPayload = {
      groqKey: enabledProviders.groq ? keys.groq : "",
      deepseekKey: enabledProviders.deepseek ? keys.deepseek : "",
      geminiKey: enabledProviders.gemini ? keys.gemini : "",
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
        toast.success(
          "Changes saved! Recommendations will update on next refresh."
        );
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

  const handleCopy = () => {
    if (!userId) return;
    navigator.clipboard.writeText(getAddonURL(userId));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const activeProviderCount = Object.values(enabledProviders).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AI Providers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            AI Providers
          </CardTitle>
          <CardDescription className="text-xs">
            {activeProviderCount === 0
              ? "Enable at least one provider for AI recommendations, or get TMDB popular content."
              : `${activeProviderCount} provider${activeProviderCount > 1 ? "s" : ""} enabled — providers are tried in order as fallback.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AI_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const enabled = enabledProviders[provider.id];
            return (
              <div
                key={provider.id}
                className={`rounded-lg border p-3 transition-all ${
                  enabled
                    ? `${provider.borderColor} ${provider.bgColor}`
                    : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-md ${
                        enabled ? provider.bgColor : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          enabled ? provider.color : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {provider.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleProvider(provider.id)}
                  />
                </div>
                {enabled && (
                  <div className="mt-2.5">
                    <PasswordInput
                      id={`${provider.id}Key`}
                      value={keys[provider.id]}
                      onChange={(v) =>
                        setKeys((prev) => ({ ...prev, [provider.id]: v }))
                      }
                      placeholder={provider.placeholder}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Trakt.tv Integration */}
      {!isNew && userId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Trakt.tv
            </CardTitle>
            <CardDescription className="text-xs">
              Connect your Trakt account for personalized &quot;Because You
              Watched&quot; recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    existingConfig?.traktConnected
                      ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]"
                      : "bg-zinc-600"
                  }`}
                />
                <span className="text-sm">
                  {existingConfig?.traktConnected
                    ? "Connected to Trakt.tv"
                    : "Not connected"}
                </span>
              </div>
              {existingConfig?.traktConnected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  onClick={handleDisconnectTrakt}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <a href={getTraktAuthURL(userId)}>
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                    Connect
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Genres */}
          <div className="space-y-2.5">
            <Label className="text-xs text-muted-foreground">Genres</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={genres.includes(genre) ? "default" : "outline"}
                  className={`cursor-pointer select-none transition-colors text-xs ${
                    genres.includes(genre)
                      ? "bg-violet-600 hover:bg-violet-700 border-violet-600"
                      : "hover:border-violet-500/50"
                  }`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-2.5">
            <Label className="text-xs text-muted-foreground">
              Content Types
            </Label>
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
            <Label
              htmlFor="language"
              className="text-xs text-muted-foreground"
            >
              Language
            </Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div className="space-y-2.5">
            <Label className="text-xs text-muted-foreground">Mood</Label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={mood === value ? "default" : "outline"}
                  className={`cursor-pointer select-none transition-colors text-xs ${
                    mood === value
                      ? "bg-cyan-600 hover:bg-cyan-700 border-cyan-600"
                      : "hover:border-cyan-500/50"
                  }`}
                  onClick={() => setMood(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Minimum Rating
              </Label>
              <span className="text-sm font-semibold tabular-nums text-violet-400">
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
        className="w-full bg-violet-600 hover:bg-violet-700 font-medium"
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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Install Addon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] text-cyan-400 bg-muted/50 px-3 py-2 rounded-md break-all font-mono leading-relaxed">
                {getAddonURL(userId)}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => window.open(getInstallURL(userId), "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install in Stremio / Nuvio
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
