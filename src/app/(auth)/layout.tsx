import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-neutral-950 px-4 overflow-hidden transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute -top-[20%] -left-[20%] -z-10 h-[60vw] w-[60vw] bg-gradient-to-br from-orange-400/20 to-amber-400/0 rounded-full blur-3xl opacity-60 dark:opacity-40" />
      <div className="absolute -bottom-[20%] -right-[20%] -z-10 h-[60vw] w-[60vw] bg-gradient-to-br from-purple-500/10 to-orange-400/0 rounded-full blur-3xl opacity-40 dark:opacity-30" />
      
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
