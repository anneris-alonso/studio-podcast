"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Send, Ban, Loader2 } from "lucide-react";
import { resendInvite, cancelBooking } from "@/app/(admin)/admin/bookings/_actions";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const [isResending, startResend] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const router = useRouter();

  const handleResendInvite = () => {
    startResend(async () => {
      try {
        const result = await resendInvite(bookingId);
        if (result.success) {
          toast.success("Calendar invite resent successfully");
        } else {
          toast.error("Failed to resend invite: " + result.error);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleCancelBooking = () => {
      if(!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

      startCancel(async () => {
        try {
            const result = await cancelBooking(bookingId);
            if (result.success) {
                toast.success("Booking cancelled successfully");
                router.refresh();
            } else {
                toast.error("Failed to cancel: " + result.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
      });
  }

  return (
    <div className="space-y-2">
      <Button 
        variant="secondary" 
        className="w-full justify-start" 
        onClick={handleResendInvite}
        disabled={isResending}
      >
        {isResending ? (
             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
             <Send className="w-4 h-4 mr-2" />
        )}
        {isResending ? "Sending..." : "Resend Calendar Invite"}
      </Button>

      {status !== 'CANCELLED' && status !== 'COMPLETED' && (
           <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={handleCancelBooking}
                disabled={isCancelling}
            >
                {isCancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Ban className="w-4 h-4 mr-2" />
                )}
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
      )}
    </div>
  );
}
