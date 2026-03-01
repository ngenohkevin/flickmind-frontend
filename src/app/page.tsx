import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/icon.svg"
              alt="FlickMind"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              FlickMind
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            AI-powered movie & TV recommendations for Stremio and Nuvio
          </p>
        </div>

        <div className="grid gap-4 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-violet-500 font-mono text-sm mt-0.5">
              01
            </span>
            <div>
              <p className="font-medium">Bring your own AI key</p>
              <p className="text-sm text-muted-foreground">
                Groq, DeepSeek, or Gemini — use whichever you prefer
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-violet-500 font-mono text-sm mt-0.5">
              02
            </span>
            <div>
              <p className="font-medium">Set your preferences</p>
              <p className="text-sm text-muted-foreground">
                Genres, mood, language, min rating — make it yours
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-violet-500 font-mono text-sm mt-0.5">
              03
            </span>
            <div>
              <p className="font-medium">Install in one click</p>
              <p className="text-sm text-muted-foreground">
                Add to Stremio or Nuvio and see personalized catalogs
              </p>
            </div>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Link href="/configure">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}
