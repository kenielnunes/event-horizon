'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { EventStatusBadge } from "./event-status-badge";
import { format } from "date-fns";
import { Event, EventDetails } from '@/types';
import { useState } from 'react';
import { EventDetailsSheet } from './event-details-sheet';

export function EventTable() {
  const { data: events, isLoading, refetch, isFetching } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events'); 
      return res.data;
    },
    refetchInterval: 5000, // Polling automático a cada 5s
  });
  const [selectedEvent, setSelectedEvent] = useState<EventDetails| null>(null);
  

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Stream</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
              <TableHead></TableHead> {/* Ações */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Loading stream...</TableCell>
              </TableRow>
            ) : events?.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <EventStatusBadge status={event.status} />
                </TableCell>
                <TableCell className="font-mono text-xs">{event.externalId}</TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell>{event.attempts}</TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {format(new Date(event.createdAt), 'HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedEvent(event as EventDetails)} variant="ghost" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Componente da Sheet fora da tabela */}
      <EventDetailsSheet 
        event={selectedEvent} 
        open={!!selectedEvent} 
        onOpenChange={(open) => !open && setSelectedEvent(null)} 
      />
      </CardContent>
    </Card>
  );
}