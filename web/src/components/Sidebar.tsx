"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useDB } from "@/lib/useDB";
import { logout } from "@/lib/auth";
import { miParticipacion } from "@/lib/participacion";
import { fmtPct } from "@/lib/format";
import {
  IconPanel,
  IconCow,
  IconPasture,
  IconHealth,
  IconRepro,
  IconMilk,
  IconMoney,
  IconTask,
  IconBox,
  IconUser,
  IconLogout,
  IconClose,
  IconHome,
} from "./icons";

const NAV = [
  { href: "/", label: "Inicio", section: "General", Icon: IconHome },
  { href: "/panel", label: "Panel", section: "General", Icon: IconPanel },
  { href: "/tareas", label: "Tareas del día", section: "General", Icon: IconTask },
  { href: "/mi-operacion", label: "Mi operación", section: "General", Icon: IconUser },
  { href: "/animales", label: "Animales", section: "Hato", Icon: IconCow },
  { href: "/potreros", label: "Potreros", section: "Hato", Icon: IconPasture },
  { href: "/sanidad", label: "Sanidad", section: "Salud", Icon: IconHealth },
  { href: "/reproduccion", label: "Reproducción", section: "Salud", Icon: IconRepro },
  { href: "/produccion", label: "Producción", section: "Números", Icon: IconMilk },
  { href: "/gastos", label: "Gastos", section: "Números", Icon: IconMoney },
  { href: "/inventario", label: "Inventario", section: "Números", Icon: IconBox },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar(props: SidebarProps) {
  const mobileOpen = props.mobileOpen ?? false;
  const onClose = props.onClose;
  const path = usePathname();
  const { user } = useAuth();
  const { db } = useDB();
  const sections = Array.from(new Set(NAV.map((n) => n.section)));
  const initials = user ? user.nombre.slice(0, 2).toUpperCase() : "";
  const share =
    user && db ? miParticipacion(user.id, db.animales) : { count: 0, pct: 0 };

  const asideClass =
    "flex flex-col w-[280px] md:w-[248px] shrink-0 border-r border-rule z-50 " +
    "fixed md:sticky md:top-0 inset-y-0 left-0 " +
    "transition-transform duration-200 ease-out " +
    (mobileOpen ? "translate-x-0" : "-translate-x-full") +
    " md:translate-x-0";

  return (
    <div className="contents">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="md:hidden fixed inset-0 z-40"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
        />
      ) : null}

      <aside
        className={asideClass}
        style={{
          background: "var(--surface-solid)",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div className="px-5 pt-6 pb-6 flex items-center gap-3">
          <BrandMark />
          <div className="flex-1 min-w-0">
            <div className="text-[0.95rem] font-serif font-semibold tracking-tight leading-none">
              Las Delicias
            </div>
            <div className="text-[0.62rem] text-accent font-mono tracking-[0.14em] uppercase mt-1">
              Ganadería
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-surface-2 transition"
            aria-label="Cerrar menú"
          >
            <IconClose size={16} />
          </button>
        </div>

        <nav className="px-3 flex-1 flex flex-col gap-5 overflow-y-auto">
          {sections.map((section) => (
            <div key={section}>
              <div className="px-2 mb-2 text-[0.62rem] font-mono uppercase tracking-[0.14em] text-subtle">
                {section}
              </div>
              <ul className="flex flex-col gap-0.5">
                {NAV.filter((n) => n.section === section).map((item) => {
                  const active =
                    item.href === "/"
                      ? path === "/"
                      : item.href === "/panel"
                      ? path === "/panel"
                      : path.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={"nav-link " + (active ? "active" : "")}
                      >
                        <item.Icon className="nav-icon" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-rule">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold shrink-0"
                style={{
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                  border: "1.5px solid var(--surface-solid)",
                  boxShadow: "0 0 12px -4px var(--primary-glow)",
                }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.nombre}</div>
                <div className="text-[0.62rem] font-mono text-subtle uppercase tracking-wider">
                  {fmtPct(share.pct)} · {share.count}{" "}
                  {share.count === 1 ? "cabeza" : "cabezas"}
                </div>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-surface-2 transition shrink-0"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <IconLogout size={15} />
              </button>
            </div>
          ) : null}
          <div className="mt-4 text-[0.62rem] text-subtle font-mono flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 6px var(--primary)" }}
            />
            v0.2 · local
          </div>
        </div>
      </aside>
    </div>
  );
}

function BrandMark() {
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0"
      style={{
        background: "var(--surface-solid)",
        border: "1px solid var(--rule)",
        boxShadow: "0 4px 16px -4px var(--primary-glow)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Las Delicias"
        className="w-full h-full object-contain p-0.5"
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const parent = img.parentElement;
          if (parent && !parent.querySelector("svg")) {
            parent.insertAdjacentHTML(
              "beforeend",
              `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l4 5-4 5-4-5z" stroke="var(--primary)" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 18h12" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round"/></svg>`
            );
          }
        }}
      />
    </div>
  );
}
