'use client';

export default function AdminProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
      {/* Header Info Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>

      {/* Main Table Skeleton */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#FDFBF7]">
                <th className="px-6 py-4"><div className="h-3 w-10 bg-gray-200 rounded" /></th>
                <th className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></th>
                <th className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                <th className="px-6 py-4"><div className="h-3 w-12 bg-gray-200 rounded" /></th>
                <th className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></th>
                <th className="px-6 py-4 text-right"><div className="h-3 w-12 bg-gray-200 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(6)].map((_, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl" />
                  </td>
                  <td className="px-6 py-4 space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-24 bg-gray-100 rounded-md" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 bg-gray-100 rounded-md" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded-md" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
