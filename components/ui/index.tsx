import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border border-white/10", className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn("glass-card overflow-hidden", className)}
    >
      {children}
    </div>
  );
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  loading,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass', loading?: boolean }) {
  const variants = {
    primary: "accent-gradient text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
    outline: "border border-white/10 bg-transparent hover:bg-white/5 text-slate-300",
    glass: "glass-button text-white"
  };

  return (
    <button 
      className={cn(
        "px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
