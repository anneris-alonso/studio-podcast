"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
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
  const [bookingData, setBookingData] = useState<BookingData>({
    studio: null,
    package: null,
    packageQuantity: 1,
    dateTime: { date: null, startTime: null, endTime: null },
    services: [],
    timeZone: "Asia/Dubai",
  });

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
          onBack={prevStep}
        />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-premium-purple/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold premium-gradient-text">Book Your Session</h1>
          <p className="text-muted-foreground">Follow the steps below to reserve your studio time.</p>
        </header>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 px-2 overflow-x-auto no-scrollbar gap-4">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-2 min-w-fit">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep > idx + 1 ? "bg-premium-gold border-premium-gold text-black" :
                currentStep === idx + 1 ? "border-premium-gold text-premium-gold shadow-[0_0_15px_rgba(232,189,95,0.3)]" :
                "border-muted text-muted-foreground"
              }`}>
                {currentStep > idx + 1 ? "✓" : idx + 1}
              </div>
              <span className={`text-xs font-medium ${currentStep === idx + 1 ? "text-premium-gold" : "text-muted-foreground"}`}>
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
