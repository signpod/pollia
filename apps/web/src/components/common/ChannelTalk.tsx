"use client";

import { useEffect } from "react";

const CHANNEL_PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY;

declare global {
  interface Window {
    ChannelIO?: (command: string, options?: Record<string, unknown>) => void;
    ChannelIOInitialized?: boolean;
  }
}

export function ChannelTalk() {
  useEffect(() => {
    if (!CHANNEL_PLUGIN_KEY) {
      return;
    }

    if (window.ChannelIO) {
      console.error("ChannelIO script included twice.");
      return;
    }

    const ch = ((...args: unknown[]) => {
      ch.c(args);
    }) as {
      (command: string, options?: Record<string, unknown>): void;
      q: unknown[][];
      c: (args: unknown[]) => void;
    };
    ch.q = [];
    ch.c = (args: unknown[]) => {
      ch.q.push(args);
    };
    window.ChannelIO = ch as Window["ChannelIO"];

    const loadScript = () => {
      if (window.ChannelIOInitialized) return;
      window.ChannelIOInitialized = true;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";

      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    };

    if (document.readyState === "complete") {
      loadScript();
    } else {
      window.addEventListener("DOMContentLoaded", loadScript);
      window.addEventListener("load", loadScript);
    }

    window.ChannelIO?.("boot", {
      pluginKey: CHANNEL_PLUGIN_KEY,
    });

    return () => {
      window.ChannelIO?.("shutdown");
      window.ChannelIO = undefined;
      window.ChannelIOInitialized = false;
    };
  }, []);

  return null;
}
