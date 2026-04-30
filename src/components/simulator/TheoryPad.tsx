"use client";

import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

const THEORY_KEY = "prediction-playground-theory";

export function TheoryPad() {
  const [note, setNote] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNote(window.localStorage.getItem(THEORY_KEY) ?? "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEORY_KEY, note);
  }, [note]);

  return (
    <section className="theoryPad" aria-label="Theory pad">
      <header className="panelHeader">
        <NotebookPen size={17} aria-hidden />
        <h2>Theory</h2>
      </header>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={180}
        placeholder="I think..."
      />
    </section>
  );
}
