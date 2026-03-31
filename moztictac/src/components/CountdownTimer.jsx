import { useState, useEffect } from "react";

/**
 * CountdownTimer — live HH:MM:SS countdown starting at 11:42:37.
 * Cycles back to 23:59:59 on reaching zero.
 */
export function CountdownTimer() {
  const [time, setTime] = useState({ h: 11, m: 42, s: 37 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-500 font-bold">:</span>}
          <span className="bg-gray-900 text-white text-xs font-black px-2 py-1 rounded tabular-nums">
            {v}
          </span>
        </span>
      ))}
    </div>
  );
}