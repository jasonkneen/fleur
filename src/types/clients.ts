export enum ClientType {
  Claude = "Claude",
  Cursor = "Cursor",
  Windsurf = "Windsurf",
}

export const ClientTypeLabels = {
  [ClientType.Claude]: "Claude",
  [ClientType.Cursor]: "Cursor",
  [ClientType.Windsurf]: "Windsurf",
};

export const clientIconMap = {
  [ClientType.Claude]: "/claude.svg",
  [ClientType.Cursor]: "/cursor.png",
  [ClientType.Windsurf]: "/windsurf.png",
};
