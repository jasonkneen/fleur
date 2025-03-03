import { Clock, HardDrive } from "lucide-react";

import type { App } from "@/types/components/app";

export const apps: App[] = [
  {
    name: "Browser",
    description: "Web browser",
    stars: 1000,
    icon: {
      type: "url",
      url: `/servers/browser.svg`,
    },
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Time",
    description: "Time",
    stars: 1000,
    icon: {
      type: "lucide",
      icon: Clock,
    },
    category: "Utilities",
    price: "Get",
    developer: "Model Context Protocol",
  },
  {
    name: "Hacker News",
    description: "Hacker News",
    stars: 1000,
    icon: {
      type: "url",
      url: `/servers/yc.svg`,
    },
    category: "Social",
    price: "Get",
    developer: "Y Combinator",
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    stars: 1000,
    icon: {
      type: "url",
      url: `/servers/gmail.svg`,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    stars: 1000,
    icon: {
      type: "url",
      url: `/servers/gcal.svg`,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    stars: 1000,
    icon: {
      type: "lucide",
      icon: HardDrive,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
] as const;
