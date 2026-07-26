"use client";

import { useTranslations } from "next-intl";
import type { CalculatorProductInput } from "@/lib/calculator/calculator.types";
import CalculatorField from "./CalculatorField";

interface DynamicCalculatorFormProps {
  input: CalculatorProductInput;
  onChangeInput: (newInput: CalculatorProductInput) => void;
}

function ModeCard({
  icon,
  title,
  description,
  isActive,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col text-left items-start p-4 sm:p-5 rounded-2xl border transition-all duration-300 w-full overflow-hidden group
        ${
          isActive
            ? "bg-surface-elevated border-primary-yellow shadow-[0_0_20px_rgba(252,211,77,0.15)] -translate-y-1"
            : "bg-background/40 border-white/10 hover:border-primary-yellow/40 hover:bg-surface-elevated hover:shadow-lg hover:-translate-y-1"
        }
      `}
    >
      {/* Background Glow when active */}
      {isActive && (
        <div className="absolute inset-0 bg-primary-yellow/5 pointer-events-none" />
      )}

      <div
        className={`
          flex items-center justify-center w-12 h-12 rounded-full mb-4 text-2xl transition-colors duration-300 shadow-sm
          ${
            isActive
              ? "bg-primary-yellow/20 border border-primary-yellow/50 text-primary-yellow"
              : "bg-white/5 border border-white/10 text-text-secondary group-hover:text-text-primary group-hover:border-white/20"
          }
        `}
      >
        {icon}
      </div>
      <h4
        className={`text-sm sm:text-base font-bold tracking-wide mb-1.5 transition-colors duration-300 ${
          isActive ? "text-primary-yellow" : "text-text-primary group-hover:text-primary-yellow/90"
        }`}
      >
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed transition-colors duration-300 group-hover:text-text-primary/80">
        {description}
      </p>
    </button>
  );
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
          <div className="flex flex-col gap-3 mb-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.modeLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                icon="🧱"
                title={t("inputs.calcByWallDimensions")}
                description={t("inputs.calcByWallDimensionsDesc")}
                isActive={input.mode !== "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "dimensions" })}
              />
              <ModeCard
                icon="📦"
                title={t("inputs.calcByQuantity")}
                description={t("inputs.calcByQuantityDesc")}
                isActive={input.mode === "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "quantity" })}
              />
            </div>
          </div>

          {input.mode === "quantity" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorField
                id="wall-quantity"
                label={t("inputs.quantity")}
                type="number"
                value={input.quantity || 0}
                onChange={(e) =>
                  onChangeInput({ ...input, quantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      );

    case "paving_area":
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 mb-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.modeLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                icon="🔲"
                title={t("inputs.calcByArea")}
                description={t("inputs.calcByAreaDesc")}
                isActive={input.mode !== "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "dimensions" })}
              />
              <ModeCard
                icon="📦"
                title={t("inputs.calcByQuantity")}
                description={t("inputs.calcByQuantityDesc")}
                isActive={input.mode === "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "quantity" })}
              />
            </div>
          </div>

          {input.mode === "quantity" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorField
                id="paving-quantity"
                label={t("inputs.quantity")}
                type="number"
                value={input.quantity || 0}
                onChange={(e) =>
                  onChangeInput({ ...input, quantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          ) : (
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
          )}
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
          <div className="flex flex-col gap-3 mb-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.modeLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                icon="📏"
                title={t("inputs.calcByRunningMeters")}
                description={t("inputs.calcByRunningMetersDesc")}
                isActive={input.mode !== "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "dimensions" })}
              />
              <ModeCard
                icon="📦"
                title={t("inputs.calcByQuantity")}
                description={t("inputs.calcByQuantityDesc")}
                isActive={input.mode === "quantity"}
                onClick={() => onChangeInput({ ...input, mode: "quantity" })}
              />
            </div>
          </div>

          {input.mode === "quantity" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorField
                id="curbstone-quantity"
                label={t("inputs.quantity")}
                type="number"
                value={input.quantity || 0}
                onChange={(e) =>
                  onChangeInput({ ...input, quantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          ) : (
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
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="flex flex-col gap-3 mb-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.modeLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                icon="🏗️"
                title={t("inputs.modeDirect")}
                description={t("inputs.modeDirectDesc")}
                isActive={input.mode === "direct"}
                onClick={() => onChangeInput({ ...input, mode: "direct" })}
              />
              <ModeCard
                icon="📏"
                title={t("inputs.modeDimensions")}
                description={t("inputs.modeDimensionsDesc")}
                isActive={input.mode === "dimensions"}
                onClick={() => onChangeInput({ ...input, mode: "dimensions" })}
              />
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
