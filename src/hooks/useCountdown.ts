import { useEffect, useState } from 'react';

// Seconds remaining until `deadline` (a timestamp in ms), updated every second.
// Returns null until the first tick, so nothing is rendered from a stale value.
export function useCountdown(deadline: number | null): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (deadline === null) return;

    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return deadline === null ? null : secondsLeft;
}
