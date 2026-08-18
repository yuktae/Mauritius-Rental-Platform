"use client";

import { useEffect, useState } from "react";

/**
 * Whether the browser believes it is online.
 *
 * navigator.onLine only reports whether a network interface exists, so it
 * returns true on a captive portal that is swallowing every request. Treat
 * false as reliable and true as a hint; the request layer added in M4 is what
 * detects a connection that is up but not working.
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
