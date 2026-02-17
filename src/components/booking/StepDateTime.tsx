"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface DateTimeData {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
}

interface StepDateTimeProps {
  studioId: string | undefined;
  package: any;
  selected: DateTimeData;
  onSelect: (dt: DateTimeData) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export function StepDateTime({ studioId, package: pkg, selected, onSelect, onNext, onBack }: StepDateTimeProps) {
  const [date, setDate] = useState(selected.date || "");
  const [startTime, setStartTime] = useState(selected.startTime || "");

  const handleSelect = (time: string) => {
    setStartTime(time);
    const [hours, minutes] = time.split(":");
    
    // Duration logic
    let durationHours = 1;
    if (pkg?.unit === 'HOUR') durationHours = pkg.packageQuantity || 1;
    else if (pkg?.unit === 'DAY') durationHours = (pkg.packageQuantity || 1) * 24;
    else durationHours = (pkg?.durationMinutes || 60) / 60;

    const end = `${String(parseInt(hours) + durationHours).padStart(2, '0')}:${minutes}`;
    
    onSelect({
      date,
      startTime: time,
      endTime: end
    });
  };

  const isFormValid = date && startTime;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label htmlFor="booking-date" className="flex items-center gap-2 text-sm font-medium text-accent-violet">
            <Calendar className="w-4 h-4" />
            Pick a Date
          </label>
          <input 
            id="booking-date"
            title="Select booking date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-fg/5 border border-border rounded-r-lg p-3 text-fg focus:border-accent-violet outline-none transition-all"
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-[10px] text-muted uppercase tracking-widest">
            Timezone: Asia/Dubai (GST)
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-accent-violet">
            <Clock className="w-4 h-4" />
            Available Slots
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleSelect(slot)}
                disabled={!date}
                className={`p-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                  startTime === slot 
                    ? "bg-accent-violet border-accent-violet text-white shadow-glow" 
                    : "bg-fg/5 border-border text-muted hover:border-accent-violet/30 hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="bg-accent-violet/5 border-accent-violet/20">
        <div className="text-sm">
          <span className="text-accent-violet font-bold">INFO:</span> Real-time availability is checked against the server. Final validation occurs during confirmation.
        </div>
      </GlassCard>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button 
          variant="primary" 
          disabled={!isFormValid} 
          onClick={onNext}
          className="px-8"
        >
          Add Services
        </Button>
      </div>
    </div>
  );
}
