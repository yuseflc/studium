"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { searchAvailableUsersAction } from "@/app/actions/adminActions";
import { IconSearch, IconChevronLeft, IconChevronRight, IconLoader2 } from "@tabler/icons-react";

type UserResult = { _id: string; firstName: string; email: string };

interface Props {
  onSelect: (user: UserResult) => void;
  onCancel: () => void;
}

export default function UserSearchSelector({ onSelect, onCancel }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<UserResult[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runSearch(q: string, p: number) {
    startTransition(async () => {
      const data = await searchAvailableUsersAction(q, p);
      setResults(data.users);
      setTotal(data.total);
      setPages(data.pages);
    });
  }

  // Búsqueda inicial al montar
  useEffect(() => {
    runSearch("", 1);
  }, []);

  // Debounce al escribir
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      runSearch(query, 1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToPage(p: number) {
    setPage(p);
    runSearch(query, p);
  }

  return (
    <div className="border border-base-300 rounded-2xl bg-base-100 shadow-md p-4 mt-3 space-y-3">
      {/* Buscador */}
      <label className="input input-bordered flex items-center gap-2 input-sm">
        <IconSearch size={15} className="text-base-content/40 shrink-0" />
        <input
          type="text"
          className="grow"
          placeholder="Buscar por nombre o email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {isPending && <IconLoader2 size={15} className="animate-spin text-base-content/40 shrink-0" />}
      </label>

      {/* Resultados */}
      <div className="min-h-[120px]">
        {results.length === 0 && !isPending ? (
          <p className="text-sm text-base-content/40 text-center py-6">
            {query ? "No se encontraron usuarios sin organización." : "No hay usuarios disponibles."}
          </p>
        ) : (
          <ul className="divide-y divide-base-200">
            {results.map((u) => (
              <li key={u._id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors flex flex-col"
                  onClick={() => onSelect(u)}
                >
                  <span className="text-sm font-semibold text-base-content">{u.firstName}</span>
                  <span className="text-xs text-base-content/50">{u.email}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paginación + contador */}
      <div className="flex items-center justify-between pt-1 border-t border-base-200">
        <span className="text-xs text-base-content/40">
          {total} usuario{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost btn-xs btn-square"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            aria-label="Página anterior"
          >
            <IconChevronLeft size={14} />
          </button>
          <span className="text-xs px-2">
            {page} / {pages || 1}
          </span>
          <button
            className="btn btn-ghost btn-xs btn-square"
            disabled={page >= pages || isPending}
            onClick={() => goToPage(page + 1)}
            aria-label="Página siguiente"
          >
            <IconChevronRight size={14} />
          </button>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
