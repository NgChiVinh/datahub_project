import { Suspense } from "react";
import DocumentsContent from "./DocumentsContent";

export const dynamic = "force-dynamic";

function DocumentsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-50/50 border-b border-slate-100 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="h-3 w-28 bg-slate-200 rounded-full animate-pulse mb-3" />
          <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-2.5">
            {[80, 65, 70, 60, 72].map((w, i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 rounded-xl animate-pulse"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* Main skeleton */}
          <div className="flex-1">
            <div className="h-14 bg-slate-100 rounded-2xl animate-pulse mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[1.5rem] border border-slate-100 overflow-hidden"
                >
                  <div className="aspect-[16/11] bg-slate-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-2.5 w-16 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                    <div
                      className="h-4 bg-slate-100 rounded-full animate-pulse"
                      style={{ width: "70%" }}
                    />
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-100 rounded-xl animate-pulse flex-shrink-0" />
                      <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<DocumentsSkeleton />}>
      <DocumentsContent />
    </Suspense>
  );
}
