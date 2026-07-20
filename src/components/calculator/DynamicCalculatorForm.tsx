"use client";

import { useTranslations } from "next-intl";
import type { CalculatorProductInput } from "@/lib/calculator/calculator.types";
import CalculatorField from "./CalculatorField";

interface DynamicCalculatorFormProps {
  input: CalculatorProductInput;
  onChangeInput: (newInput: CalculatorProductInput) => void;
}

export default function DynamicCalculatorForm({
  input,
  onChangeInput,
}: DynamicCalculatorFormProps) {
  const t = useTranslations("calculator");

  switch (input.type) {
    case "wall_blocks":
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorField
              id="wall-length"
              label={t("inputs.wallLength")}
              type="number"
              value={input.lengthMeters}
              onChange={(e) =>
                onChangeInput({ ...input, lengthMeters: parseFloat(e.target.value) || 0 })
              }
              suffix="m"
            />
            <CalculatorField
              id="wall-height"
              label={t("inputs.wallHeight")}
              type="number"
              value={input.heightMeters}
              onChange={(e) =>
                onChangeInput({ ...input, heightMeters: parseFloat(e.target.value) || 0 })
              }
              suffix="m"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorField
              id="wall-count"
              label={t("inputs.wallCount")}
              type="number"
              value={input.wallCount}
              onChange={(e) =>
                onChangeInput({ ...input, wallCount: parseInt(e.target.value, 10) || 1 })
              }
              min={1}
              step={1}
            />
            <CalculatorField
              id="wall-reserve"
              label={t("inputs.reservePercent")}
              type="number"
              value={input.reservePercent}
              onChange={(e) =>
                onChangeInput({ ...input, reservePercent: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
              min={0}
              max={25}
            />
          </div>
        </div>
      );

    case "paving_area":
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorField
              id="surface-length"
              label={t("inputs.surfaceLength")}
              type="number"
              value={input.lengthMeters}
              onChange={(e) =>
                onChangeInput({ ...input, lengthMeters: parseFloat(e.target.value) || 0 })
              }
              suffix="m"
            />
            <CalculatorField
              id="surface-width"
              label={t("inputs.surfaceWidth")}
              type="number"
              value={input.widthMeters}
              onChange={(e) =>
                onChangeInput({ ...input, widthMeters: parseFloat(e.target.value) || 0 })
              }
              suffix="m"
            />
          </div>
          <CalculatorField
            id="paving-reserve"
            label={t("inputs.reservePercent")}
            type="number"
            value={input.reservePercent}
            onChange={(e) =>
              onChangeInput({ ...input, reservePercent: parseFloat(e.target.value) || 0 })
            }
            suffix="%"
            min={0}
            max={25}
          />
        </div>
      );

    case "curbstones":
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorField
              id="linear-length"
              label={t("inputs.linearLength")}
              type="number"
              value={input.linearLengthMeters}
              onChange={(e) =>
                onChangeInput({ ...input, linearLengthMeters: parseFloat(e.target.value) || 0 })
              }
              suffix="m"
            />
            <CalculatorField
              id="curb-reserve"
              label={t("inputs.reservePercent")}
              type="number"
              value={input.reservePercent}
              onChange={(e) =>
                onChangeInput({ ...input, reservePercent: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
              min={0}
              max={25}
            />
          </div>
        </div>
      );

    case "concrete_volume":
      return (
        <div className="flex flex-col gap-4">
          {/* Mode Selector Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.modeLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeInput({ ...input, mode: "direct" })}
                className={`py-2 px-3 text-xs font-mono font-bold rounded-lg border transition-all ${
                  input.mode === "direct"
                    ? "bg-surface-elevated border-primary-yellow/60 text-primary-yellow"
                    : "bg-background/80 border-white/10 text-text-primary hover:border-primary-yellow/30"
                }`}
              >
                {t("inputs.modeDirect")}
              </button>
              <button
                type="button"
                onClick={() => onChangeInput({ ...input, mode: "dimensions" })}
                className={`py-2 px-3 text-xs font-mono font-bold rounded-lg border transition-all ${
                  input.mode === "dimensions"
                    ? "bg-surface-elevated border-primary-yellow/60 text-primary-yellow"
                    : "bg-background/80 border-white/10 text-text-primary hover:border-primary-yellow/30"
                }`}
              >
                {t("inputs.modeDimensions")}
              </button>
            </div>
          </div>

          {input.mode === "direct" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorField
                id="direct-volume"
                label={t("inputs.directVolume")}
                type="number"
                value={input.directVolumeM3}
                onChange={(e) =>
                  onChangeInput({ ...input, directVolumeM3: parseFloat(e.target.value) || 0 })
                }
                suffix="m³"
              />
              <CalculatorField
                id="concrete-reserve-1"
                label={t("inputs.reservePercent")}
                type="number"
                value={input.reservePercent}
                onChange={(e) =>
                  onChangeInput({ ...input, reservePercent: parseFloat(e.target.value) || 0 })
                }
                suffix="%"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CalculatorField
                  id="concrete-length"
                  label={t("inputs.surfaceLength")}
                  type="number"
                  value={input.lengthMeters}
                  onChange={(e) =>
                    onChangeInput({ ...input, lengthMeters: parseFloat(e.target.value) || 0 })
                  }
                  suffix="m"
                />
                <CalculatorField
                  id="concrete-width"
                  label={t("inputs.surfaceWidth")}
                  type="number"
                  value={input.widthMeters}
                  onChange={(e) =>
                    onChangeInput({ ...input, widthMeters: parseFloat(e.target.value) || 0 })
                  }
                  suffix="m"
                />
                <CalculatorField
                  id="concrete-depth"
                  label={t("inputs.concreteDepth")}
                  type="number"
                  value={input.depthMeters}
                  onChange={(e) =>
                    onChangeInput({ ...input, depthMeters: parseFloat(e.target.value) || 0 })
                  }
                  suffix="m"
                />
              </div>
              <CalculatorField
                id="concrete-reserve-2"
                label={t("inputs.reservePercent")}
                type="number"
                value={input.reservePercent}
                onChange={(e) =>
                  onChangeInput({ ...input, reservePercent: parseFloat(e.target.value) || 0 })
                }
                suffix="%"
              />
            </div>
          )}
        </div>
      );

    case "quantity_product":
      return (
        <div className="flex flex-col gap-4">
          <CalculatorField
            id="product-quantity"
            label={t("inputs.quantity")}
            type="number"
            value={input.quantity}
            onChange={(e) =>
              onChangeInput({ ...input, quantity: parseInt(e.target.value, 10) || 1 })
            }
            min={1}
            step={1}
            suffix="pcs"
          />
        </div>
      );

    default:
      return null;
  }
}
