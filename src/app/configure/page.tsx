import Image from "next/image";
import { ConfigForm } from "@/components/config-form";

export default function ConfigurePage() {
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
              Configure your AI-powered recommendations
            </p>
          </div>
        </div>
        <ConfigForm />
      </div>
    </main>
  );
}
