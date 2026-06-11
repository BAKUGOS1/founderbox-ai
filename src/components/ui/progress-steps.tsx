import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProgressSteps({
  steps,
  currentStep,
  running
}: {
  steps: string[];
  currentStep: number;
  running: boolean;
}) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const complete = index < currentStep;
        const current = index === currentStep && running;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-surface2/48 p-3 text-sm",
              complete && "border-success/30 text-success",
              current && "border-gold/40 text-gold"
            )}
          >
            {complete ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : current ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Circle className="h-4 w-4 text-muted" />
            )}
            <span>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
