"use client";

import { useState, useRef, useEffect } from "react";

export interface CityOption {
  name: string;
  latitude: number;
  longitude: number;
}

interface CityPickerProps {
  id: string;
  value: string;
  cities: CityOption[];
  onSelect: (city: CityOption) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CityPicker({
  id,
  value,
  cities,
  onSelect,
  onClear,
  placeholder,
  disabled,
}: CityPickerProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? cities
        .filter((c) => c.name.toLowerCase().startsWith(q))
        .slice(0, 10)
    : cities.slice(0, 10);

  const handleChange = (val: string) => {
    setQuery(val);
    setOpen(true);
    setActiveIndex(-1);
    if (val !== value) onClear();
  };

  const pick = (c: CityOption) => {
    setQuery(c.name);
    setOpen(false);
    onSelect(c);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

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
        value={query}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {open && matches.length > 0 && !disabled && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-lg shadow-black/40">
          {matches.map((c, i) => (
            <li
              key={`${c.name}-${c.latitude}-${c.longitude}`}
              onMouseDown={() => pick(c)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-gold-muted text-gold"
                  : "text-text-primary hover:bg-bg-surface-hover"
              }`}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
