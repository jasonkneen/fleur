export enum ClientType {
  Claude = "Claude",
  Cursor = "Cursor",
}

export const ClientTypeLabels = {
  [ClientType.Claude]: "Claude",
  [ClientType.Cursor]: "Cursor",
};

export const clientIconMap = {
  [ClientType.Claude]: "/claude.svg",
  [ClientType.Cursor]: "/cursor.png",
};
