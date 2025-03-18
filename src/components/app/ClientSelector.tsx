import { clientIconMap, ClientType, ClientTypeLabels } from "@/types/clients";
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
        <Button variant="outline" className="justify-between bg-gradient-to-b from-white to-sand-100 text-xs h-8 px-2">
          <img src={clientIconMap[currentClient]} alt={ClientTypeLabels[currentClient]} className="w-4 h-4" />
          {ClientTypeLabels[currentClient]}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.values(ClientType).map((client) => (
          <DropdownMenuItem
            key={client}
            onClick={() => {
              onClientChange(client);
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <img src={clientIconMap[client]} alt={ClientTypeLabels[client]} className="w-4 h-4" />
              {ClientTypeLabels[client]}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}