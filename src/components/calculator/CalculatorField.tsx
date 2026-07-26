"use client";

import { ChangeEvent } from "react";

interface CalculatorFieldProps {
  id: string;
  label: string;
  type?: "number" | "select";
  value: number | string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  suffix?: string;
}

export default function CalculatorField({
  id,
  label,
  type = "number",
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 0.1,
  options = [],
  suffix,
}: CalculatorFieldProps) {
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
            className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg px-4 py-3 border border-white/10 focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200 cursor-pointer appearance-none"
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
            type="number"
            value={value}
            onChange={(e) => {
              // Strip leading zeroes before a number (e.g. "0111" -> "111")
              if (e.target.value.length > 1 && /^0+(?=\d)/.test(e.target.value)) {
                e.target.value = e.target.value.replace(/^0+(?=\d)/, "");
              }
              onChange(e);
            }}
            min={min}
            max={max}
            step={step}
            className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg px-4 py-3 border border-white/10 focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200 font-mono"
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

        {/* Suffix label (e.g. "m") */}
        {suffix && type !== "select" && (
          <span className="absolute right-4 font-mono text-xs font-bold text-primary-yellow/80 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
