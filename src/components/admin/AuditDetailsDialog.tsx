"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDubaiDate } from "@/lib/format";
import { Eye, Clock, User, Activity, Box } from "lucide-react";

interface AuditDetailsDialogProps {
  log: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailsDialog({ log, isOpen, onClose }: AuditDetailsDialogProps) {
  if (!log) return null;

  const humanizeAction = (action: string) => {
    return action
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return <p className="text-muted-foreground italic">No additional details.</p>;

    if (metadata.changed && Array.isArray(metadata.changed)) {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-white/70">Modified Fields:</p>
          <div className="flex flex-wrap gap-2">
            {metadata.changed.map((field: string) => (
              <Badge key={field} variant="outline" className="bg-white/5 border-white/10 capitalize">
                {field.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
            The administrator updated specific attributes of this entity to maintain system accuracy.
          </p>
        </div>
      );
    }

    // Generic fallback for other metadata structures
    return (
      <div className="bg-black/20 rounded-xl p-4 border border-white/5 font-mono text-[11px] overflow-auto max-h-[300px]">
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Event Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 font-sans">
          {/* Left Column: Basic Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Activity className="w-3 h-3" /> Action Performed
              </label>
              <p className="text-sm font-semibold text-foreground">
                {humanizeAction(log.action)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <User className="w-3 h-3" /> Performed By
              </label>
              <p className="text-sm text-foreground/80">{log.actorEmail}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Box className="w-3 h-3" /> Target Entity
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                  {log.entity}
                </Badge>
                {log.entityId && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    #{log.entityId.substring(0, 8)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Clock className="w-3 h-3" /> Timestamp
              </label>
              <p className="text-xs text-muted-foreground font-mono">
                {formatDubaiDate(log.createdAt, "MMMM dd, yyyy 'at' HH:mm:ss")}
              </p>
            </div>
          </div>

          {/* Right Column: Metadata Details */}
          <div className="space-y-4">
             <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
               <Eye className="w-3 h-3" /> Deep Details
              </label>
              <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200 h-full min-h-[160px]">
                {renderMetadata(log.metadata)}
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
