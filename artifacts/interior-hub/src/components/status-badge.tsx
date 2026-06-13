import { Badge } from "@/components/ui/badge";
import type { EngineerStatus } from "@/types";

interface StatusBadgeProps {
  status: EngineerStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
        Approved
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Pending
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
      Disabled
    </Badge>
  );
}
