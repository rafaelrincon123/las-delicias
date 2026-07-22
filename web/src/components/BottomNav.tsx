"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconTask,
  IconCow,
  IconHealth,
  IconMoney,
} from "./icons";

const ITEMS = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/tareas", label: "Tareas", Icon: IconTask },
  { href: "/animales", label: "Hato", Icon: IconCow },
  { href: "/sanidad", label: "Sanidad", Icon: IconHealth },
  { href: "/gastos", label: "Gastos", Icon: IconMoney },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{
        background: "color-mix(in oklab, var(--surface-solid) 95%, transparent)",
        borderColor: "var(--rule-strong)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="flex justify-around items-stretch px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition"
              style={{
                color: active ? "var(--primary)" : "var(--muted)",
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-6 rounded-full transition"
                style={{
                  background: active ? "var(--primary-soft)" : "transparent",
                }}
              >
                <Icon size={18} />
              </div>
              <span
                className="text-[0.6rem] font-medium"
                style={{ letterSpacing: "-0.005em" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
