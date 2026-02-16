import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import type { StudioRoom } from "@shared/schema";

interface BookingModalProps {
  room: StudioRoom;
}

export function BookingModal({ room }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("2");
  const { user } = useAuth();
  const createBooking = useCreateBooking();

  const handleBooking = () => {
    if (!date || !user) return;

    // Calculate start and end ISO strings
    const start = new Date(date);
    const [hours, mins] = startTime.split(":").map(Number);
    start.setHours(hours, mins, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + parseInt(duration));

    // Calculate price
    const hoursNum = parseInt(duration);
    const totalPrice = parseFloat(room.hourlyRate.toString()) * hoursNum;

    createBooking.mutate({
      userId: user.id,
      roomId: room.id,
      startTime: start.toISOString(), // Changed to string for Zod compat
      endTime: end.toISOString(),     // Changed to string for Zod compat
      totalPrice: totalPrice,
      status: "pending",
    }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Book {room.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-white",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="bg-zinc-950 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Start Time</label>
              <Select onValueChange={setStartTime} defaultValue="09:00">
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 9; // Start at 9 AM
                    const time = `${h.toString().padStart(2, '0')}:00`;
                    return <SelectItem key={time} value={time}>{time}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Duration</label>
              <Select onValueChange={setDuration} defaultValue="2">
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="4">4 Hours</SelectItem>
                  <SelectItem value="8">Full Day (8h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400">Rate</span>
              <span className="font-medium">${room.hourlyRate}/hr</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-zinc-800">
              <span>Total</span>
              <span>
                ${(parseFloat(room.hourlyRate.toString()) * parseInt(duration)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleBooking} 
          disabled={!date || createBooking.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
