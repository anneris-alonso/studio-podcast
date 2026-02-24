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
      <div className="glass-card-premium p-8 border-gradient-fine">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <label htmlFor="booking-date" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent-violet">
              <Calendar className="w-4 h-4" />
              Pick a Date
            </label>
            <input 
              id="booking-date"
              title="Select booking date"
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none transition-all font-sans cursor-pointer"
              style={{ colorScheme: 'dark' }}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Timezone: Asia/Dubai (GST) 
            </p>
          </div>

          <div className="space-y-6">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent-violet">
              <Clock className="w-4 h-4" />
              Available Slots
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSelect(slot)}
                  disabled={!date}
                  className={`p-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
                    startTime === slot 
                      ? "bg-brand-gradient border-transparent text-white shadow-[0_0_15px_rgba(255,42,133,0.4)]" 
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card-premium p-4 border-accent-violet/30 bg-accent-violet/5">
        <div className="text-sm text-white/70 flex items-start gap-3">
          <span className="text-accent-violet font-bold bg-accent-violet/10 px-2 py-0.5 rounded uppercase tracking-widest text-[10px] shrink-0 mt-0.5">INFO</span> 
          <span>Real-time availability is checked against the server. Final validation occurs during confirmation.</span>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack} className="text-white/50 hover:text-white hover:bg-white/5">Back</Button>
        <Button 
          disabled={!isFormValid} 
          onClick={onNext}
          className="px-8 h-14 rounded-2xl text-md font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          Add Services
        </Button>
      </div>
    </div>
  );
}
