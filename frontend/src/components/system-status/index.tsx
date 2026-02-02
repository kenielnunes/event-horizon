'use client';
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function SystemStatus() {
  const { data: apiStatus } = useQuery({
    queryKey: ['apiStatus'],
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    },
  });

  const { data: workerStatus } = useQuery({
    queryKey: ['workerStatus'],
    queryFn: async () => {
      const res = await api.get('/worker/health');
      return res.data;
    },
  });
  
  const isWorkerOnline = workerStatus?.status === 'ok' ? true : false;
  const isApiOnline = apiStatus?.status === 'ok' ? true : false;
  return (
    <div className="flex gap-4">
      <div className="text-sm">API: <span className={isApiOnline ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{isApiOnline ? 'Online' : 'Offline'}</span></div>
      <div className="text-sm">Worker: <span className={isWorkerOnline ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{isWorkerOnline ? 'Online' : 'Offline'}</span></div>
    </div>
  );
}