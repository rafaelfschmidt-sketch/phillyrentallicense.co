"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "e.g. 1234 N BROAD ST",
  accentColor = "#50b8a2",
  className = "",
  style = {},
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestedRef = useRef<string>("");

  // Debounced fetch as user types
  useEffect(() => {
    const q = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      lastRequestedRef.current = q;
      setLoading(true);
      try {
        const res = await fetch(`/api/philly/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        // Race guard: if user typed something newer in the meantime, drop this result.
        if (lastRequestedRef.current !== q) return;
        setSuggestions(data.suggestions || []);
        setOpen((data.suggestions || []).length > 0);
        setActive(-1);
      } catch {
        // non-blocking
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
    setActive(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setOpen(true);
        setActive((i) => (i + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && active < suggestions.length) {
        e.preventDefault();
        pick(suggestions[active]);
      } else if (onSubmit) {
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
        spellCheck={false}
      />
      {loading && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: accentColor }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 rounded-xl border bg-white shadow-lg overflow-hidden max-h-72 overflow-y-auto"
          style={{ borderColor: "#e2e3e7" }}
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              style={{
                color: "#333543",
                backgroundColor: i === active ? "#f7f6f3" : "transparent",
              }}
            >
              {s}
            </li>
          ))}
          <li
            className="px-4 py-2 text-[11px] border-t"
            style={{ color: "#b0b2bc", borderColor: "#f0efec", backgroundColor: "#fafaf9" }}
          >
            Matched from Philadelphia OPA records
          </li>
        </ul>
      )}
    </div>
  );
}
