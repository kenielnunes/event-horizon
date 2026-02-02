'use client';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Play, Activity } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EventStatusBadge } from "./event-status-badge";
import { EventDetails } from "@/types";
import { toast } from "sonner";

interface Props {
  event: EventDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsSheet({ event, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const replayMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.post(`/events/${eventId}/replay`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onOpenChange(false); 
      toast.success('Evento re-enviado com sucesso');
    },
    onError: () => {
      toast.error('Falha ao re-enviar evento');
    },
  });

  if (!event) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <EventStatusBadge status={event.status} />
            <span className="text-xs text-muted-foreground font-mono">
              {event.id.slice(0, 8)}...
            </span>
          </div>
          <SheetTitle>Event Details</SheetTitle>
          <SheetDescription>
            External ID: <span className="font-mono text-foreground">{event.externalId}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          <div className="space-y-6">
            
            {/* Payload Viewer */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Payload Data
              </h3>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(event.payload, null, 2)}</pre>
              </div>
            </div>

            <Separator />

            {/* Timeline de Logs */}
            <div>
              <h3 className="text-sm font-medium mb-3">Processing Timeline</h3>
              <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-2 space-y-4 pl-4 pb-2">
                {event.logs?.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Bolinha da timeline */}
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${
                      log.level === 'ERROR' ? 'bg-red-500' : 
                      log.level === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), 'HH:mm:ss.SSS')}
                      </span>
                      <p className={`text-sm ${log.level === 'ERROR' ? 'text-red-600 font-medium' : ''}`}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
                
                {event.logs?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No logs available.</p>
                )}
              </div>
            </div>

          </div>
        </ScrollArea>

        <SheetFooter className="pt-4 border-t">
          <Button 
            className="w-full sm:w-auto" 
            onClick={() => replayMutation.mutate(event.id)}
            disabled={event.status === 'PROCESSING' || replayMutation.isPending}
          >
            {replayMutation.isPending ? (
              <Activity className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Replay Event
          </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}