import { clientIconMap, ClientType, ClientTypeLabels } from "@/types/clients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { loadAppStatuses } from "@/store/app";
import { useEffect } from "react";
import { loadApps } from "@/store/app";

export function ClientSelector({
  currentClient,
  onClientChange,
}: {
  currentClient: ClientType;
  onClientChange: (client: ClientType) => void;
}) {
  useEffect(() => {
    const refreshAppState = async () => {
      try {
        await loadAppStatuses(currentClient);
        await loadApps();
      } catch (error) {
        console.error('Failed to refresh app state:', error);
      }
    };

    refreshAppState();
  }, [currentClient]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between text-xs h-8 px-2">
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