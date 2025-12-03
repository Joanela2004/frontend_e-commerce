import { useState, useEffect } from "react";

export default function DateRange({ onChange }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (start && end) {
      onChange({ start, end });
    } else if (!start && !end) {
      onChange({ start: null, end: null }); // reset
    }
  }, [start, end]);

  return (
    <div className="date-range">
      <input type="date" value={start} onChange={e => setStart(e.target.value)} />
      <span>→</span>
      <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
    </div>
  );
}