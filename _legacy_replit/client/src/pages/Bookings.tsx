import { useBookings } from "@/hooks/use-bookings";
import { useRooms } from "@/hooks/use-rooms";
import { GlassCard } from "@/components/GlassCard";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { data: rooms } = useRooms();

  if (isLoading) {
    return <div className="text-white">Loading bookings...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50">Confirmed</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50">Cancelled</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/50">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming and past studio sessions.</p>
      </div>

      <div className="space-y-4">
        {bookings?.length === 0 && (
          <GlassCard className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
            <p className="text-zinc-400">Book a studio room to get started on your next project.</p>
          </GlassCard>
        )}

        {bookings?.map((booking) => {
          const room = rooms?.find(r => r.id === booking.roomId);
          return (
            <GlassCard key={booking.id} className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex flex-col items-center justify-center border border-white/10 shrink-0">
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    {format(new Date(booking.startTime), "MMM")}
                  </span>
                  <span className="text-3xl font-bold text-white">
                    {format(new Date(booking.startTime), "dd")}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {room?.name || "Unknown Room"}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Studio A, Floor 2
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-1">Total</p>
                  <p className="text-lg font-bold text-white">${booking.totalPrice}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
