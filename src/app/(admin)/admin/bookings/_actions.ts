import { requireAdmin } from '@/lib/auth-guards';
import { sendBookingCalendarInvite } from '@/server/calendar/actions';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';

export async function resendInvite(bookingId: string) {
  await requireAdmin();

  try {
    const result = await sendBookingCalendarInvite(bookingId, true); // Force resend
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send invite');
    }

    revalidatePath(`/admin/bookings/${bookingId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelBooking(id: string) {
  await requireAdmin();
  
  try {
    await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
    });
    
    // Create audit log
    await prisma.auditLog.create({
        data: {
        action: 'BOOKING_CANCEL',
        entity: 'Booking',
        entityId: id,
        actorRole: 'ADMIN',
        metadata: { reason: 'Admin cancelled via backoffice' }
        }
    });

    revalidatePath(`/admin/bookings/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
