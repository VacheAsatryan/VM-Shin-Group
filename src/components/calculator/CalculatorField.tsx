"use client";

import { ChangeEvent, useState } from "react";

interface CalculatorFieldProps {
  id: string;
  label: string;
  type?: "number" | "select" | "text";
  value: number | string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  min?: number;
  max?: number;
  step?: number | string;
  options?: { value: string; label: string }[];
  suffix?: string;
}

export default function CalculatorField({
  id,
  label,
  type = "number",
  value,
  onChange,
  options = [],
  suffix,
}: CalculatorFieldProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === undefined || value === null) return "";
    return String(value);
  });

  if (value !== prevValue) {
    setPrevValue(value);
    if (type !== "select") {
      const currentNumeric = parseFloat(displayValue);
      const incomingNumeric = typeof value === "number" ? value : parseFloat(String(value));

      if (
        !isNaN(incomingNumeric) &&
        (isNaN(currentNumeric) || currentNumeric !== incomingNumeric)
      ) {
        setDisplayValue(String(value));
      } else if (value === "" || (value === 0 && displayValue !== "" && currentNumeric !== 0)) {
        setDisplayValue(String(value));
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Normalize comma to dot for international decimal keyboard support
    raw = raw.replace(/,/g, ".");

    // Filter out everything except digits and dot
    raw = raw.replace(/[^0-9.]/g, "");

    // Allow only one decimal point
    const dotIndex = raw.indexOf(".");
    if (dotIndex !== -1) {
      const beforeDot = raw.slice(0, dotIndex + 1);
      const afterDot = raw.slice(dotIndex + 1).replace(/\./g, "");
      raw = beforeDot + afterDot;
    }

    // Strip leading zeroes before non-dot digits (e.g. "0111" -> "111", but keep "0.5" and "0")
    if (raw.length > 1 && /^0+[0-9]/.test(raw) && !raw.startsWith("0.")) {
      raw = raw.replace(/^0+/, "");
      if (raw === "") raw = "0";
    }

    setDisplayValue(raw);

    // Pass clean value to parent
    e.target.value = raw;
    onChange(e);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {type === "select" ? (
          <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg px-4 py-3 border border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200 cursor-pointer appearance-none"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={displayValue}
            onChange={handleInputChange}
            className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg px-4 py-3 border border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200 font-mono"
          />
        )}

        {/* Custom Chevron indicator for Select */}
        {type === "select" && (
          <div className="absolute right-4 pointer-events-none text-text-secondary" aria-hidden="true">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        {/* Suffix label (e.g. "m", "m²", "m³", "pcs", "%") */}
        {suffix && type !== "select" && (
          <span className="absolute right-4 font-mono text-xs font-bold text-primary-yellow/80 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
