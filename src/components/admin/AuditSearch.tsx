"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function AuditSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 300);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search logs (action, email, entity)..."
        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
