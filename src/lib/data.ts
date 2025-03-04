import { Clock, HardDrive } from "lucide-react";

import type { App } from "@/types/components/app";

export const apps: App[] = [
  {
    name: "Browser",
    description: "Web browser",
    icon: {
      type: "url",
      url: {
        light: `/servers/browser.svg`,
        dark: `/servers/browser.svg`,
      },
    },
    category: "Utilities",
    price: "Get",
    developer: "Google LLC",
  },
  {
    name: "Time",
    description: "Time",
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
    icon: {
      type: "url",
      url: {
        light: `/servers/yc.svg`,
        dark: `/servers/yc.svg`,
      },
    },
    category: "Social",
    price: "Get",
    developer: "Y Combinator",
  },
  {
    name: "Linear",
    description: "Linear",
    icon: {
      type: "url",
      url: {
        light: `/servers/linear-dark.svg`,
        dark: `/servers/linear-light.svg`,
      },
    },
    category: "Productivity",
    price: "Get",
    developer: "Linear",
    envVars: [
      {
        name: "LINEAR_API_KEY",
        label: "Linear API Key",
        description: "Your Linear API key for authentication",
      },
    ],
  },
  {
    name: "Gmail",
    description: "Email and messaging platform",
    icon: {
      type: "url",
      url: {
        light: `/servers/gmail.svg`,
        dark: `/servers/gmail.svg`,
      },
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    icon: {
      type: "url",
      url: {
        light: `/servers/gcal.svg`,
        dark: `/servers/gcal.svg`,
      },
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    icon: {
      type: "lucide",
      icon: HardDrive,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
  },
] as const;
