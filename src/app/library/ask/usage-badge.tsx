"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface UsageBadgeProps {
  queriesUsed: number;
  queryLimit: number;
}

export function UsageBadge({ queriesUsed, queryLimit }: UsageBadgeProps) {
  return (
    <Card className="px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Queries this month:</div>
        <Badge
          variant={
            queriesUsed >= queryLimit
              ? "destructive"
              : queriesUsed >= queryLimit * 0.8
                ? "secondary"
                : "default"
          }
        >
          {queriesUsed} /{" "}
          {queryLimit === Number.POSITIVE_INFINITY ? "∞" : queryLimit}
        </Badge>
      </div>
    </Card>
  );
}
