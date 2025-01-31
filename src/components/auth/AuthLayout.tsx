import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100 p-4">
      <div
        className={cn(
          "w-full max-w-md glass-panel rounded-xl p-8 fade-up",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}