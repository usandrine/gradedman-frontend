import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

type ProctorEvent =
  | { type: 'tab_switch' }
  | { type: 'tab_return'; awayMs: number }
  | { type: 'copy' | 'cut' | 'paste' | 'right_click' };

const BLOCKED_MESSAGES = {
  copy: 'Copying is disabled during the exam.',
  cut: 'Cutting is disabled during the exam.',
  paste: 'Pasting is disabled during the exam.',
  right_click: 'Right-click is disabled during the exam.',
};

// Basic proctoring for an exam in progress:
//   - records every time the student leaves the tab or window, and for how long
//   - blocks copy, cut, paste and right-click, and records the attempts
// Events go to the server as they happen, so the teacher sees them with the result.
export function useProctoring(examId: number, enabled: boolean) {
  const [tabSwitches, setTabSwitches] = useState(0);
  // Shown briefly after a blocked action
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  // When the student left, or null while they are on the exam
  const awaySince = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const report = (event: ProctorEvent) => {
      // Never interrupt the exam because a report failed to send
      api.post(`/exams/${examId}/proctor-events`, { events: [event] }).catch(() => undefined);
    };

    // Switching tabs fires both "hidden" and "blur" — awaySince makes sure it is counted once
    const handleLeave = () => {
      if (awaySince.current !== null) return;
      awaySince.current = Date.now();
      setTabSwitches((count) => count + 1);
      report({ type: 'tab_switch' });
    };

    const handleReturn = () => {
      if (awaySince.current === null || document.hidden || !document.hasFocus()) return;
      report({ type: 'tab_return', awayMs: Date.now() - awaySince.current });
      awaySince.current = null;
    };

    const handleVisibility = () => (document.hidden ? handleLeave() : handleReturn());

    let messageTimer: ReturnType<typeof setTimeout>;
    const block = (type: keyof typeof BLOCKED_MESSAGES) => (event: Event) => {
      event.preventDefault();
      report({ type });
      setBlockedMessage(BLOCKED_MESSAGES[type]);
      clearTimeout(messageTimer);
      messageTimer = setTimeout(() => setBlockedMessage(null), 3000);
    };

    const listeners: [EventTarget, string, EventListener][] = [
      [document, 'visibilitychange', handleVisibility],
      [window, 'blur', handleLeave],
      [window, 'focus', handleReturn],
      [document, 'copy', block('copy')],
      [document, 'cut', block('cut')],
      [document, 'paste', block('paste')],
      [document, 'contextmenu', block('right_click')],
    ];

    listeners.forEach(([target, name, listener]) => target.addEventListener(name, listener));

    return () => {
      listeners.forEach(([target, name, listener]) => target.removeEventListener(name, listener));
      clearTimeout(messageTimer);
    };
  }, [examId, enabled]);

  return { tabSwitches, blockedMessage };
}
