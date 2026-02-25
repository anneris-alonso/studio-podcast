"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { AuditDetailsDialog } from "./AuditDetailsDialog";

interface AuditRowActionsProps {
  log: any;
}

export function AuditRowActions({ log }: AuditRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0 hover:bg-white/10 text-muted-foreground hover:text-white"
      >
        <Eye className="w-4 h-4" />
        <span className="sr-only">View Details</span>
      </Button>

      <AuditDetailsDialog 
        log={log} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
