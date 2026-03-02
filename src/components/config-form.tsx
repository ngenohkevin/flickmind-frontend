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
  Check,
  ChevronDown,
  List,
  Settings2,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  type UserConfig,
  type ConfigPayload,
  createConfig,
  updateConfig,
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
  { value: "documentary", label: "Documentaries" },
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
    freeTier: "Free: 30 req/min, 14,400 req/day",
    recommended: "best",
    keyUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    keyPrefix: "gsk_",
    icon: Zap,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek-V3 — high quality",
    freeTier: "Pay-as-you-go: ~$0.14/M input, $0.28/M output tokens",
    recommended: "cheapest",
    keyUrl: "https://platform.deepseek.com/api_keys",
    placeholder: "sk-...",
    keyPrefix: "sk-",
    icon: Brain,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Gemini 2.0 Flash — Google AI",
    freeTier: "Free: 15 req/min, 1,500 req/day",
    recommended: false,
    keyUrl: "https://aistudio.google.com/apikey",
    placeholder: "AIza...",
    keyPrefix: "AIza",
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
  const [yearFrom, setYearFrom] = useState(existingConfig?.yearFrom || 0);
  const [yearTo, setYearTo] = useState(existingConfig?.yearTo || 0);
  const [maxResults, setMaxResults] = useState(existingConfig?.maxResults || 25);
  const [recommendationSource, setRecommendationSource] = useState(
    existingConfig?.recommendationSource || "preferences"
  );
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate enabled providers have keys
    for (const provider of AI_PROVIDERS) {
      if (enabledProviders[provider.id]) {
        const key = keys[provider.id];
        if (!key || key.startsWith("••••")) continue; // masked keys are ok
        if (key.length < 10) {
          newErrors[provider.id] = "API key seems too short";
        } else if (
          provider.keyPrefix &&
          !key.startsWith(provider.keyPrefix)
        ) {
          newErrors[provider.id] =
            `Key should start with "${provider.keyPrefix}"`;
        }
      }
    }

    // Validate at least one content type
    if (contentTypes.length === 0) {
      newErrors.contentTypes = "Select at least one content type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    // Warn if no providers enabled (not an error, just a heads-up)
    const hasEnabledWithKey = AI_PROVIDERS.some(
      (p) => enabledProviders[p.id] && keys[p.id] && !keys[p.id].startsWith("••••")
    );
    const hasExistingKeys = AI_PROVIDERS.some(
      (p) => enabledProviders[p.id] && keys[p.id]?.startsWith("••••")
    );
    if (!hasEnabledWithKey && !hasExistingKeys && activeProviderCount === 0) {
      // Just a warning, still allow saving
    }

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
      yearFrom,
      yearTo,
      maxResults,
      recommendationSource,
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save configuration";
      toast.error(message);
    } finally {
      setSaving(false);
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
      <Collapsible
        defaultOpen={activeProviderCount === 0}
        className="group/collapsible"
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer select-none">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                    AI Providers
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeProviderCount === 0
                      ? "Enable at least one provider for AI recommendations, or get TMDB popular content."
                      : `${activeProviderCount} provider${activeProviderCount > 1 ? "s" : ""} enabled — providers are tried in order as fallback.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {activeProviderCount > 0 && (
                    <div className="flex gap-1.5">
                      {AI_PROVIDERS.filter((p) => enabledProviders[p.id]).map(
                        (p) => {
                          const Icon = p.icon;
                          return (
                            <div
                              key={p.id}
                              className={`p-1 rounded-md ${p.bgColor} border ${p.borderColor}`}
                            >
                              <Icon className={`h-3 w-3 ${p.color}`} />
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
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
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium leading-none">
                              {provider.name}
                            </p>
                            {provider.recommended === "best" && (
                              <span className="text-[9px] font-medium uppercase tracking-wider bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                            {provider.recommended === "cheapest" && (
                              <span className="text-[9px] font-medium uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                                Best Value
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {provider.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            {provider.freeTier}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => toggleProvider(provider.id)}
                      />
                    </div>
                    {enabled && (
                      <div className="mt-2.5 space-y-1.5">
                        <PasswordInput
                          id={`${provider.id}Key`}
                          value={keys[provider.id]}
                          onChange={(v) => {
                            setKeys((prev) => ({ ...prev, [provider.id]: v }));
                            if (errors[provider.id]) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next[provider.id];
                                return next;
                              });
                            }
                          }}
                          placeholder={provider.placeholder}
                        />
                        {errors[provider.id] && (
                          <p className="text-[11px] text-destructive">
                            {errors[provider.id]}
                          </p>
                        )}
                        <a
                          href={provider.keyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-[11px] ${provider.color} hover:underline`}
                        >
                          Get API key
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Recommendation Source */}
          {existingConfig?.traktConnected && (
            <div className="space-y-2.5">
              <Label className="text-xs text-muted-foreground">
                AI Recommendations Based On
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecommendationSource("preferences")}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-all text-left ${
                    recommendationSource === "preferences"
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-border/50 opacity-60 hover:opacity-80"
                  }`}
                >
                  <Settings2
                    className={`h-4 w-4 shrink-0 ${
                      recommendationSource === "preferences"
                        ? "text-violet-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Preferences
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Genres, mood & filters
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRecommendationSource("watchlist")}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-all text-left ${
                    recommendationSource === "watchlist"
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-border/50 opacity-60 hover:opacity-80"
                  }`}
                >
                  <List
                    className={`h-4 w-4 shrink-0 ${
                      recommendationSource === "watchlist"
                        ? "text-cyan-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Trakt Watchlist
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Based on saved titles
                    </p>
                  </div>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {recommendationSource === "watchlist"
                  ? "AI will analyze your Trakt watchlist to find similar titles you'd love."
                  : "AI will use your genre, mood, and filter preferences below."}
              </p>
            </div>
          )}

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
                    onCheckedChange={() => {
                      toggleContentType(value);
                      if (errors.contentTypes) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.contentTypes;
                          return next;
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            {errors.contentTypes && (
              <p className="text-[11px] text-destructive">
                {errors.contentTypes}
              </p>
            )}
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

          {/* Year Range */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Year Range</Label>
            <div className="flex items-center gap-2">
              <select
                value={yearFrom}
                onChange={(e) => setYearFrom(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={0}>Any</option>
                {Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => new Date().getFullYear() - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <select
                value={yearTo}
                onChange={(e) => setYearTo(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={0}>Any</option>
                {Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => new Date().getFullYear() - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
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

          {/* Max Results */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Results per Catalog
              </Label>
              <span className="text-sm font-semibold tabular-nums text-violet-400">
                {maxResults}
              </span>
            </div>
            <Slider
              value={[maxResults]}
              onValueChange={([v]) => setMaxResults(v)}
              min={10}
              max={50}
              step={5}
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
