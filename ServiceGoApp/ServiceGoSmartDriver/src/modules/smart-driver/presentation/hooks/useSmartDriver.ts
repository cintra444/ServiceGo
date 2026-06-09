import { useEffect, useState } from "react";

import { getLogs, LogEntry, subscribeLogs } from "@/core/logging/logger";
import { useSmartDriverContext } from "@/modules/smart-driver/presentation/providers/SmartDriverProvider";

export function useSmartDriver() {
  const context = useSmartDriverContext();
  const [logs, setLogs] = useState<LogEntry[]>(getLogs());

  useEffect(() => subscribeLogs(setLogs), []);

  return {
    ...context,
    logs,
  };
}

