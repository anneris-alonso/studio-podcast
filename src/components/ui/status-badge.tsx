import { Badge } from "./badge";
import { BookingStatus, SubscriptionStatus } from "@prisma/client";

type Status = BookingStatus | SubscriptionStatus | "PAST_DUE";

export function StatusBadge({ status }: { status: Status | string }) {
  const s = status.toUpperCase();

  let variant: "default" | "success" | "warning" | "destructive" | "outline" = "outline";
  let label = status;

  if (s === "PAID" || s === "ACTIVE") {
    variant = "success";
  } else if (s === "CONFIRMED" || s === "TRIALING") {
    variant = "warning";
  } else if (s === "CANCELLED" || s === "CANCELED" || s === "EXPIRED") {
    variant = "outline";
  } else if (s === "PAST_DUE" || s === "UNPAID") {
    variant = "destructive";
  }

  return (
    <Badge variant={variant} className="uppercase tracking-tighter text-[10px]">
      {label}
    </Badge>
  );
}
