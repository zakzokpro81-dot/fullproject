import { useState, useCallback } from "react";

export function useMessageDialog() {
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    message: "",
    severity: "info",
  });

  const showMessageDialog = useCallback(
    (message, severity = "info", title) => {
      const defaultTitles = {
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Info",
      };
      setMessageDialog({
        open: true,
        title: title || defaultTitles[severity] || "Notification",
        message,
        severity,
      });
    },
    []
  );

  const closeMessageDialog = useCallback(() => {
    setMessageDialog((prev) => ({ ...prev, open: false }));
  }, []);

  return { messageDialog, showMessageDialog, closeMessageDialog };
}
