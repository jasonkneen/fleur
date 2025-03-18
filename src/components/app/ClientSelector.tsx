import { ClientType, ClientTypeLabels } from "@/types/clients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function ClientSelector({
  currentClient,
  onClientChange,
}: {
  currentClient: ClientType;
  onClientChange: (client: ClientType) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-between">
          {ClientTypeLabels[currentClient]}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(ClientType).map((client) => (
          <DropdownMenuItem
            key={client}
            onClick={() => {
              onClientChange(client);
            }}
          >
            {ClientTypeLabels[client]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}