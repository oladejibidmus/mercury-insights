import { useState, useEffect, useCallback, useRef } from "react";

interface UseQuizTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function useQuizTimer({ initialMinutes, onTimeUp, isActive }: UseQuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  const hasTriggeredRef = useRef(false);

  // Keep the callback ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Start/stop timer based on isActive
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(initialMinutes * 60);
      setIsRunning(true);
      hasTriggeredRef.current = false;
    } else {
      setIsRunning(false);
    }
  }, [isActive, initialMinutes]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
              onTimeUpRef.current();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getTimeColor = useCallback(() => {
    const percentRemaining = (timeRemaining / (initialMinutes * 60)) * 100;
    if (percentRemaining <= 10) return "text-destructive";
    if (percentRemaining <= 25) return "text-yellow-500";
    return "text-primary";
  }, [timeRemaining, initialMinutes]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const reset = useCallback(() => {
    setTimeRemaining(initialMinutes * 60);
    setIsRunning(false);
    hasTriggeredRef.current = false;
  }, [initialMinutes]);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    timeColor: getTimeColor(),
    isRunning,
    pause,
    resume,
    reset,
    percentRemaining: (timeRemaining / (initialMinutes * 60)) * 100,
  };
}
