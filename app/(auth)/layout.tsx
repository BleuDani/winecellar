import { Wine, GlassWater, Grape } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none text-primary opacity-[0.07] dark:opacity-[0.05]"
        aria-hidden="true"
      >
        <Wine className="absolute -top-8 -left-10 size-48 rotate-[-15deg]" />
        <GlassWater className="absolute top-1/4 -right-12 size-56 rotate-[12deg]" />
        <Grape className="absolute bottom-10 left-1/4 size-40 rotate-[8deg]" />
        <Wine className="absolute -bottom-12 -right-8 size-52 rotate-[20deg]" />
        <Grape className="absolute top-10 right-1/3 size-32 rotate-[-10deg]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
