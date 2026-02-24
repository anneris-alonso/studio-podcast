"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StepStudio } from "@/components/booking/StepStudio";
import { StepPackage } from "@/components/booking/StepPackage";
import { StepDateTime } from "@/components/booking/StepDateTime";
import { StepServices } from "@/components/booking/StepServices";
import { StepReview } from "@/components/booking/StepReview";

const STEPS = [
  "Select Studio",
  "Select Package",
  "Date & Time",
  "Optional Services",
  "Review & Confirm",
];

interface Studio {
  id: string;
  name: string;
  description: string;
  capacity: number;
  hourlyRate: any;
  imageUrl?: string;
  type: string;
}

interface Package {
  id: string;
  name: string;
  price: any;
  credits: number;
  validityDays: number;
  studioRoomId: string | null;
  unit: 'HOUR' | 'DAY' | 'FIXED_MINUTES';
  minQuantity: number;
  maxQuantity: number;
  stepQuantity: number;
  pricePerUnitMinor: number;
  durationMinutes: number;
}

interface Service {
  id: string;
  name: string;
  price: any;
  unit: 'PER_BOOKING' | 'PER_HOUR' | 'PER_DAY' | 'FIXED';
  minQuantity: number;
  maxQuantity: number;
  stepQuantity: number;
}

interface DateTimeData {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
}

interface BookingData {
  studio: Studio | null;
  package: Package | null;
  packageQuantity: number;
  dateTime: DateTimeData;
  services: { id: string; name: string; price: any; quantity: number }[];
  timeZone: string;
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData>({
    studio: null,
    package: null,
    packageQuantity: 1,
    dateTime: { date: null, startTime: null, endTime: null },
    services: [],
    timeZone: "Asia/Dubai",
  });

  // Auth gate: redirect unauthenticated users to login
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setAuthChecked(true);
        } else {
          // Redirect to login with return URL
          router.replace("/login?from=/book");
        }
      })
      .catch(() => {
        router.replace("/login?from=/book");
      });
  }, [router]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepStudio 
          selected={bookingData.studio} 
          onSelect={(studio) => setBookingData({ ...bookingData, studio, package: null })} 
          onNext={nextStep} 
        />;
      case 2:
        return <StepPackage 
          studioId={bookingData.studio?.id} 
          selected={bookingData.package} 
          packageQuantity={bookingData.packageQuantity}
          onSelect={(pkg, qty) => setBookingData({ ...bookingData, package: pkg, packageQuantity: qty })} 
          onNext={nextStep} 
          onBack={prevStep} 
        />;
      case 3:
        return <StepDateTime 
          studioId={bookingData.studio?.id}
          package={bookingData.package}
          selected={bookingData.dateTime}
          onSelect={(dt) => setBookingData({ ...bookingData, dateTime: dt })}
          onNext={nextStep}
          onBack={prevStep}
        />;
      case 4:
        return <StepServices 
          selected={bookingData.services}
          packageQuantity={bookingData.packageQuantity}
          packageUnit={bookingData.package?.unit || 'FIXED_MINUTES'}
          onUpdate={(newList) => setBookingData({ ...bookingData, services: newList as any })}
          onNext={nextStep}
          onBack={prevStep}
        />;
      case 5:
        return <StepReview 
          data={bookingData}
          userId={currentUser?.id}
          onBack={prevStep}
        />;
      default:
        return null;
    }
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent-violet animate-spin mx-auto" />
          <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Verifying access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-pink/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight">
             Book Your <span className="premium-gradient-text tracking-tighter"><span>Session.</span></span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Follow the steps below to reserve your studio time.</p>
        </header>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-12 px-4 overflow-x-auto no-scrollbar gap-4 relative">
          <div className="absolute top-5 left-12 right-12 h-[1px] bg-white/10 -z-10 hidden md:block" />
          {STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-3 min-w-fit">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                currentStep > idx + 1 ? "bg-accent-violet/20 border-accent-violet text-accent-violet shadow-[0_0_15px_rgba(122,92,255,0.4)]" :
                currentStep === idx + 1 ? "bg-black border-accent-pink text-accent-pink shadow-[0_0_20px_rgba(255,42,133,0.3)] scale-110" :
                "bg-black border-white/10 text-white/30"
              }`}>
                {currentStep > idx + 1 ? "✓" : idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${currentStep === idx + 1 ? "text-accent-pink" : currentStep > idx + 1 ? "text-white/70" : "text-white/30"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
