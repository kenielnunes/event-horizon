import { EventTable } from "@/components/events/events-table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="z-10 max-w-5xl w-full items-start justify-between font-mono text-sm flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Event Processing Platform
          </h1>
          <p className="text-slate-500">
            Console Operacional para ingestão e processamento de eventos distribuídos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Métricas Rápidas (Placeholder) */}
          <div className="bg-white p-4 rounded-lg border shadow-sm col-span-1 md:col-span-3">
            <h3 className="font-semibold mb-2">System Status</h3>
            <div className="flex gap-4">
              <div className="text-sm">API: <span className="text-green-600 font-bold">Online</span></div>
              <div className="text-sm">Worker: <span className="text-green-600 font-bold">Active</span></div>
            </div>
          </div>

          {/* Tabela Principal */}
          <div className="col-span-1 md:col-span-3">
            <EventTable />
          </div>
        </div>
      </div>
    </main>
  );
}