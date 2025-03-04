import { Clock, HardDrive, Youtube } from 'lucide-react';
import type { App } from "@/types/components/app";

export const apps: App[] = [
  {
    name: "Browser",
    description: "This is a browser app that allows Claude to navigate to any website, take screenshots, and interact with the page.",
    icon: {
      type: "url",
      url: {
        light: `/servers/browser.svg`,
        dark: `/servers/browser.svg`,
      },
    },
    category: "Utilities",
    price: "Free",
    developer: "Google LLC",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    features: [
      {
        name: "Navigate to any website",
        description: "Navigate to any URL in the browser",
        prompt: "Navigate to the URL google.com and...",
      },
      {
        name: "Interact with any website - search, click, scroll, screenshot, etc.",
        description: "Click elements on the page",
        prompt: "Go to google.com and search for...",
      }
    ],
    setup: []
  },
  {
    name: "Time",
    description: "Get the current time",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    icon: {
      type: "lucide",
      icon: Clock,
    },
    category: "Utilities",
    price: "Free",
    developer: "Model Context Protocol",
    features: [{
      name: "Get the current time",
      description: "Get the current time",
      prompt: "What is the current time?",
    }],
    setup: []
  },
  {
    name: "Hacker News",
    description: "Hacker News MCP which allows Claude to get the top stories on Hacker News and summarize discussion threads.",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    icon: {
      type: "url",
      url: {
        light: `/servers/yc.svg`,
        dark: `/servers/yc.svg`,
      },
    },
    category: "Social",
    price: "Free",
    developer: "Y Combinator",
    features: [{
      name: "Get the top stories on Hacker News",
      description: "Get the top stories on Hacker News",
      prompt: "What are the top stories on Hacker News?",
    }, {
      name: "Summarize discussion threads on Hacker News",
      description: "Summarize discussion threads on Hacker News",
      prompt: "Summarize the discussion thread on Hacker News titled...",
    }]
  },
  {
    name: "Gmail",
    description: "Gmail MCP which allows Claude to get digests and summaries of emails, read and reply to emails, and search for emails.",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
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
    features: [{
      name: "Get digests and summaries of emails",
      description: "Get digests and summaries of emails",
      prompt: "Give me a digest of my emails from today...",
    }, {
      name: "Read and reply to emails",
      description: "Read and reply to emails",
      prompt: "Read the email from...",
    }, {
      name: "Search for emails",
      description: "Search for emails",
      prompt: "Search for emails containing...",
    }],
    setup: [{
      label: 'Step 1',
      type: 'text',
      value: 'Enter your Gmail email address',
      key: 'gmail_info',
    }, {
      label: 'Step 2',
      type: 'input',
      placeholder: 'Enter your Gmail password',
      key: 'gmail_password',
    }] 
  },
  {
    name: "Linear",
    description: "Linear",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
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
    features: [{
      name: "Ask Claude about your Linear issues",
      description: "Ask Claude about your Linear issues",
      prompt: "What are the most important issues in my Linear board?",
    }, {
      name: "Create a new issue in Linear",
      description: "Create a new issue in Linear",
      prompt: "Create a new issue in Linear titled...",
    }],
    setup: [
      {
        label: "Linear API Key",
        type: "input",
        placeholder: "Enter your Linear API key",
        value: "Enter your Linear API key",
        key: "LINEAR_API_KEY",
      },
    ],
  },
  {
    name: "Google Calendar",
    description: "Schedule and organize events",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
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
    features: []
  },
  {
    name: "Google Drive",
    description: "Cloud storage and file sharing",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    icon: {
      type: "lucide",
      icon: HardDrive,
    },
    category: "Productivity",
    price: "Free",
    developer: "Google LLC",
    features: []
  },
  {
    name: "YouTube",
    description: "Video streaming platform",
    sourceUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    icon: {
      type: "lucide",
      icon: Youtube,
    },
    category: "Entertainment",
    price: "Free",
    developer: "Google LLC",
    features: []
  },
] as const;
