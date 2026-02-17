import { listActivePlans } from "@/server/data-access";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await listActivePlans() as any[];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold premium-gradient-text">Choose Your Plan</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Scale your content production with our flexible subscription plans.
            All plans include premium studio access and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <GlassCard key={plan.id} className="flex flex-col space-y-6 p-8 relative overflow-hidden group">
              {plan.slug === 'pro' && (
                <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold">AED {Number(plan.monthlyPrice) / 100}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{plan.includedCredits} Recording Hours / Month</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Premium Equipment Access</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Expert Technical Assistant</span>
                </div>
                {plan.includedCredits >= 25 && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>Priority Booking</span>
                  </div>
                )}
                {plan.includedCredits >= 60 && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>Dedicated Locker Space</span>
                  </div>
                )}
              </div>

              <SubscribeButton planSlug={plan.slug} />
            </GlassCard>
          ))}
        </div>

        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            Looking for something custom? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Client component for the button logic
function SubscribeButton({ planSlug }: { planSlug: string }) {
  return (
    <Button 
      variant="glass" 
      className="w-full py-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
      asChild
    >
      <Link href={`/api/subscriptions/checkout-session?planSlug=${planSlug}`}>
        Get Started
      </Link>
    </Button>
  );
}
