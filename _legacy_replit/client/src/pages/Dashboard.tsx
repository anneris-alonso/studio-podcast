import { useAuth } from "@/hooks/use-auth";
import { useRooms } from "@/hooks/use-rooms";
import { useBookings } from "@/hooks/use-bookings";
import { GlassCard } from "@/components/GlassCard";
import { BookingModal } from "@/components/BookingModal";
import { format } from "date-fns";
import { Music, Camera, Mic, Clock, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: rooms } = useRooms();
  const { data: bookings } = useBookings();

  // Filter for upcoming bookings
  const upcomingBookings = bookings?.filter(b => 
    new Date(b.startTime) > new Date() && b.status !== "cancelled"
  ).slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Good Evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">Welcome to your creative workspace.</p>
        </div>
        <div className="flex gap-4">
          <GlassCard className="px-4 py-2 flex items-center gap-3 !bg-zinc-900/60">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Credits</p>
              <p className="font-bold text-white">2,450</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rooms List - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Available Studios</h2>
            <Link href="/rooms" className="text-sm text-primary hover:text-primary/80">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms?.map((room) => (
              <GlassCard key={room.id} className="p-0 overflow-hidden group">
                {/* Hero Image Area */}
                <div className="h-48 bg-zinc-800 relative">
                  {/* Fallback pattern if no image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                  
                  {/* Room Type Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white flex items-center gap-2">
                    {room.type === 'recording' && <Music className="w-3 h-3" />}
                    {room.type === 'photography' && <Camera className="w-3 h-3" />}
                    {room.type === 'podcast' && <Mic className="w-3 h-3" />}
                    <span className="capitalize">{room.type}</span>
                  </div>

                  {/* Hourly Rate */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-white">
                    ${room.hourlyRate}/hr
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{room.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 line-clamp-2">{room.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black" />
                      <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black" />
                      <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black flex items-center justify-center text-[10px] text-white">
                        +{room.capacity}
                      </div>
                    </div>
                    <div className="w-32">
                      <BookingModal room={room} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}

            {/* Loading Skeletons */}
            {!rooms && [1, 2].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-zinc-900/20 animate-pulse border border-white/5" />
            ))}
          </div>
        </div>

        {/* Sidebar - Upcoming Bookings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
          
          <div className="space-y-4">
            {upcomingBookings?.length === 0 && (
              <div className="text-center py-10 text-zinc-500">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No upcoming sessions</p>
              </div>
            )}

            {upcomingBookings?.map(booking => {
              const room = rooms?.find(r => r.id === booking.roomId);
              return (
                <GlassCard key={booking.id} className="p-4 flex gap-4 items-center group cursor-pointer hover:bg-zinc-800/50">
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 flex-shrink-0 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xs text-zinc-400 font-medium uppercase">
                      {format(new Date(booking.startTime), "MMM")}
                    </span>
                    <span className="text-xl font-bold text-white">
                      {format(new Date(booking.startTime), "dd")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{room?.name || "Studio Room"}</h4>
                    <p className="text-sm text-primary">
                      {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                </GlassCard>
              );
            })}
          </div>

          <GlassCard className="p-6 bg-gradient-to-br from-primary/20 to-blue-600/10 border-primary/20">
            <h3 className="font-bold text-white mb-2">Need a custom plan?</h3>
            <p className="text-sm text-zinc-400 mb-4">Get up to 40% discount on bulk credit purchases.</p>
            <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white">
              View Packages
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
