import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background">
      <GlassCard className="max-w-lg text-center space-y-6">
        <h1 className="text-4xl font-bold premium-gradient-text">
          Studio Suite
        </h1>
        <p className="text-muted-foreground">
          Welcome to your new premium podcast studio management platform. 
          Step 1 bootstrap is complete.
        </p>
        <div className="pt-4">
          <Link href="/ui">
            <Button variant="glass" className="w-full text-lg py-6 border-primary/30 hover:border-primary/60">
              View UI Showcase
            </Button>
          </Link>
        </div>
      </GlassCard>
    </main>
  );
}
