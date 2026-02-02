import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";


const variants: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  RECEIVED: "secondary",   
  PROCESSING: "default",    
  PROCESSED: "outline",     
  FAILED: "destructive",    
};

export function EventStatusBadge({ status }: { status: string }) {
  const s = status as Status;
  const colorClass = s === 'PROCESSED' ? 'text-green-600 border-green-600' : '';
  
  return (
    <Badge variant={variants[s] || "outline"} className={colorClass}>
      {status}
    </Badge>
  );
}