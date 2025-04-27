
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/20 relative overflow-hidden">
        {/* Abstract background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Logo background pattern */}
        <div className="absolute inset-0 bg-[url('/logo.svg')] bg-center opacity-3 bg-repeat-space" />
        
        {/* Content container */}
        <div
          className={cn(
            "relative w-full max-w-md rounded-xl p-8 shadow-lg",
            "bg-background/90 backdrop-blur-sm border border-muted",
            "transition-all duration-300 hover:shadow-xl",
            className
          )}
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
