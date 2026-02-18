import { formatAED, formatDubaiDate } from "@/lib/format";

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const footer = `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
    <p>© ${new Date().getFullYear()} Dubai Podcast Studio. All rights reserved.</p>
    <p>Manage your account at <a href="${APP_URL}/account">${APP_URL}/account</a></p>
  </div>
`;

export function getBookingPaidEmail(options: { 
  userName: string, 
  roomName: string, 
  startTime: Date, 
  totalAmountMinor: number, 
  bookingId: string 
}) {
  const { userName, roomName, startTime, totalAmountMinor, bookingId } = options;
  const formattedDate = formatDubaiDate(startTime, "PPPP");
  const formattedTime = formatDubaiDate(startTime, "p");

  return {
    subject: `Booking Confirmed: ${roomName} — ${formattedDate}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #000; font-size: 24px; font-weight: bold;">Booking Confirmed!</h1>
        <p>Hi ${userName.split(' ')[0]},</p>
        <p>Your podcast session at <strong>${roomName}</strong> is confirmed for <strong>${formattedDate} at ${formattedTime}</strong>.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
          <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 900;">${formatAED(totalAmountMinor)}</p>
        </div>

        <p>You can view your booking details and download any assets from your portal:</p>
        <a href="${APP_URL}/account/bookings/${bookingId}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px 0;">
          View Booking Details
        </a>

        <p>A calendar invite (.ics) has been attached to this email for your convenience.</p>
        
        ${footer}
      </div>
    `,
    text: `Booking Confirmed: ${roomName} for ${formattedDate} at ${formattedTime}. Amount Paid: ${formatAED(totalAmountMinor)}. View details at ${APP_URL}/account/bookings/${bookingId}`
  };
}

export function getPaymentFailedEmail(options: { userName: string, bookingId: string }) {
  const { userName, bookingId } = options;
  return {
    subject: "Payment Failed: Please Update Your Payment Details",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #e53e3e; font-size: 24px; font-weight: bold;">Payment Failed</h1>
        <p>Hi ${userName.split(' ')[0]},</p>
        <p>We were unable to process the payment for your booking.</p>
        <p>To keep your session confirmed, please try again using a different payment method:</p>
        <a href="${APP_URL}/pay/${bookingId}" style="display: inline-block; background: #e53e3e; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px 0;">
          Try Payment Again
        </a>
        <p>If you have any questions, please reply to this email.</p>
        ${footer}
      </div>
    `,
    text: `Payment failed for your booking. Please try again at ${APP_URL}/pay/${bookingId}`
  };
}

export function getSubscriptionActivatedEmail(options: { 
  userName: string, 
  planName: string, 
  includedHours: number 
}) {
  const { userName, planName, includedHours } = options;
  return {
    subject: `Subscription Activated: Welcome to ${planName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #4c51bf; font-size: 24px; font-weight: bold;">Welcome to ${planName}!</h1>
        <p>Hi ${userName.split(' ')[0]},</p>
        <p>Your subscription is now active. You have <strong>${includedHours} hours</strong> of studio time available for this period.</p>
        <p>You can start using your credits immediately when booking a session.</p>
        <a href="${APP_URL}/account" style="display: inline-block; background: #4c51bf; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px 0;">
          Go to Dashboard
        </a>
        ${footer}
      </div>
    `,
    text: `Your ${planName} subscription is active with ${includedHours} hours of credit. Visit your dashboard: ${APP_URL}/account`
  };
}
