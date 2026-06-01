"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconUsers,
  IconBuilding,
  IconLayoutDashboard,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Resumen", exact: true },
  { href: "/admin/users", icon: IconUsers, label: "Usuarios", exact: false },
  { href: "/admin/organizations", icon: IconBuilding, label: "Organizaciones", exact: false },
];

function NavLink({
  href,
  icon: Icon,
  label,
  exact,
  collapsed,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
          ${isActive
            ? "bg-primary/10 text-primary"
            : "text-base-content hover:bg-base-200"
          }
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    </li>
  );
}

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`border-b border-base-300 flex items-center ${collapsed ? "justify-center p-4" : "p-5"}`}>
        {!collapsed && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-1">
              Panel de
            </p>
            <h1 className="text-xl font-extrabold text-base-content">Administración</h1>
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square ml-auto"
            aria-label="Cerrar menú"
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              collapsed={collapsed}
              onClick={onClose}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-base-300">
        <Link
          href="/mycourses"
          onClick={onClose}
          title={collapsed ? "Volver a la app" : undefined}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-base-content/60 hover:bg-base-200 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <IconChevronLeft size={14} className="shrink-0" />
          {!collapsed && <span>Volver a la app</span>}
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-base-100 border-b border-base-300 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Abrir menú de administración"
        >
          <IconMenu2 size={20} />
        </button>
        <span className="font-extrabold text-base-content">Administración</span>
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <aside className="relative w-72 bg-base-100 border-r border-base-300 h-full z-10 shadow-2xl animate-[slideInLeft_0.2s_ease-out]">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-base-100 border-r border-base-300 shrink-0 transition-all duration-300 ease-in-out relative ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <SidebarContent collapsed={!expanded} />

        {/* Toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-base-100 border border-base-300 shadow flex items-center justify-center hover:bg-base-200 transition-colors"
          aria-label={expanded ? "Colapsar sidebar" : "Expandir sidebar"}
        >
          {expanded ? <IconChevronLeft size={12} /> : <IconChevronRight size={12} />}
        </button>
      </aside>
    </>
  );
}
