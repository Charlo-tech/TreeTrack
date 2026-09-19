import { cn } from "@/lib/utils";
import { Eye, Search, BarChart3, ShieldCheck, Megaphone } from "lucide-react";

const steps = [
  { key: "monitor", label: "Monitor", icon: Eye, desc: "Satellite + field" },
  { key: "detect", label: "Detect", icon: Search, desc: "Anomaly" },
  { key: "analyze", label: "Analyze", icon: BarChart3, desc: "NDVI • Vision" },
  { key: "verify", label: "Verify", icon: ShieldCheck, desc: "Field report" },
  { key: "act", label: "Act", icon: Megaphone, desc: "Alert • SMS" },
];

export function WorkflowStepper({ active = "monitor" }: { active?: string }) {
  const activeIdx = steps.findIndex((s) => s.key === active);
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-lg border bg-white p-2">
      {steps.map((s, i) => {
        const isActive = s.key === active;
        const isPast = i < activeIdx;
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                isActive && "bg-emerald-700 text-white shadow-sm",
                isPast && "bg-emerald-50 text-emerald-800",
                !isActive && !isPast && "text-zinc-500"
              )}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="hidden lg:inline text-[10px] opacity-70">• {s.desc}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-4 bg-zinc-200 hidden sm:block" />}
          </div>
        );
      })}
    </div>
  );
}
