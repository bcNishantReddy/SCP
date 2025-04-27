
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/logo.svg')] bg-center opacity-5 bg-repeat-space rotate-12 scale-150" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent backdrop-blur-[2px]" />
        <div
          className={cn(
            "relative w-full max-w-md rounded-xl p-8 shadow-2xl",
            "bg-white/80 backdrop-blur-xl border border-white/20",
            "animate-fade-up hover-effect",
            className
          )}
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
