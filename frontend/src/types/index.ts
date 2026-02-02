interface EventLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  createdAt: string;
}

interface Event {
  id: string;
  externalId: string;
  type: string;
  status: string;
  attempts: number;
  createdAt: string;
}

interface EventDetails extends Event {
  logs: EventLog[];
  payload: any;
}

type Status = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export type { Event, EventDetails, EventLog, Status };
