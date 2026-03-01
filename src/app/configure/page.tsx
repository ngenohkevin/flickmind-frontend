import { ConfigForm } from "@/components/config-form";

export default function ConfigurePage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            FlickMind
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your AI-powered recommendations
          </p>
        </div>
        <ConfigForm />
      </div>
    </main>
  );
}
