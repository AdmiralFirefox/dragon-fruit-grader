import { useEffect, useRef } from "react";
import axios from "axios";

interface CleanupResponse {
  message: string;
}

function useSessionCleanup(sessionId: string | null): void {
  const cleanupRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const cleanup = async (): Promise<void> => {
      try {
        const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL
          ? process.env.NEXT_PUBLIC_BACKEND_URL
          : "http://localhost:8000";

        const response = await axios.post<CleanupResponse>(
          `${backend_url}/api/clear-session-output`,
          { sessionId }
        );
        console.log(response.data.message);
      } catch (error) {
        console.error("Failed to clear session:", error);
      }
    };

    cleanupRef.current = cleanup;

    const handleBeforeUnload = (): void => {
      cleanupRef.current?.();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId]);

  // Perform cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (sessionId) {
        cleanupRef.current?.();
      }
    };
  }, [sessionId]);
}

export default useSessionCleanup;
