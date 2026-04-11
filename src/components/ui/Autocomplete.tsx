"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  getSuggestions: (query: string) => Promise<string[]> | string[];
  debounceMs?: number;
}

export default function Autocomplete({
  id,
  value,
  onChange,
  placeholder,
  getSuggestions,
  debounceMs = 200,
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchSuggestions = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (query.length < 1) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      timerRef.current = setTimeout(async () => {
        const results = await getSuggestions(query);
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      }, debounceMs);
    },
    [getSuggestions, debounceMs]
  );

  const handleChange = (val: string) => {
    onChange(val);
    fetchSuggestions(val);
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.length >= 1 && fetchSuggestions(value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none transition-colors"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-lg shadow-black/40">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => selectSuggestion(s)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-gold-muted text-gold"
                  : "text-text-primary hover:bg-bg-surface-hover"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
