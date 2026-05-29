'use client';

/**
 * ParticipantsSkeleton: Placeholder mientras se cargan los datos
 * 
 * Muestra una versión esquelética de la tabla para mejorar
 * la experiencia visual durante la carga de participantes.
 */
export default function ParticipantsSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg bg-base-100 shadow-md">
      <table className="w-full text-sm">
        <thead className="border-b border-base-300 bg-base-200">
          <tr>
            <th className="w-12 p-3 text-left">
              <div className="skeleton h-4 w-4 rounded" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="skeleton h-4 w-24 rounded" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="skeleton h-4 w-32 rounded" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="skeleton h-4 w-16 rounded" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="skeleton h-4 w-24 rounded" />
            </th>
            <th className="px-4 py-3 text-center">
              <div className="skeleton h-4 w-20 rounded mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-base-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="hover:bg-base-200/50">
              <td className="p-3">
                <div className="skeleton h-4 w-4 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-40 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-6 w-20 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-24 rounded" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="skeleton h-4 w-8 rounded mx-auto" />
              </td>
              <td className="p-3">
                <div className="skeleton h-8 w-8 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
