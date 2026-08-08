"use client";

import { useTranslations } from "next-intl";
import type { CalculatorProductInput } from "@/lib/calculator/calculator.types";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
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
            : "bg-background/40 border-gold-border hover:border-primary-yellow/40 hover:bg-surface-elevated hover:shadow-lg hover:-translate-y-1"
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
              : "bg-white/5 border border-gold-border text-text-secondary group-hover:text-text-primary group-hover:border-gold-border-hover"
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
  const tProducts = useTranslations("products");

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

    case "paving_area": {
      const currentColorId = input.colorId || "gray";
      const availableColors = [
        { id: "gray", hex: "#8E949B" },
        { id: "light-gray", hex: "#C6CCD3" },
        { id: "dark-gray", hex: "#4E545B" },
        { id: "red", hex: "#9E3838" },
        { id: "brown", hex: "#6B4337" },
        { id: "sand", hex: "#D6B887" },
        { id: "mix", hex: "linear-gradient(135deg, #9E3838 0%, #6B4337 50%, #D6B887 100%)" },
      ];

      return (
        <div className="flex flex-col gap-4">
          {/* Color Selection for Paving Stones */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {tProducts("selectColor")}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((colorOpt) => {
                const isSelected = currentColorId === colorOpt.id;
                const translationKey = colorOpt.id.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                return (
                  <button
                    key={colorOpt.id}
                    type="button"
                    onClick={() => onChangeInput({ ...input, colorId: colorOpt.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-surface border-gold-primary text-white shadow-gold-glow/20 ring-1 ring-gold-primary/50"
                        : "bg-surface/50 border-gold-border/40 text-text-muted hover:text-white hover:border-gold-primary/40 hover:bg-surface"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-inner flex-none"
                      style={{ background: colorOpt.hex }}
                    />
                    <span>{tProducts(`colors.${translationKey}`) || colorOpt.id}</span>
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-primary-yellow text-black flex items-center justify-center text-[9px] font-bold flex-none">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
    }

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

    case "floor_slabs": {
      const slabCategory = CALCULATOR_PRODUCTS.find((p) => p.calculationType === "floor_slabs");
      const lengthVal =
        typeof input.lengthMeters === "number" && !isNaN(input.lengthMeters)
          ? input.lengthMeters
          : 2.9;
      const isValidLength = lengthVal >= 2.9 && lengthVal <= 6.3;
      const activeVariant =
        slabCategory?.variants.find((v) => v.id === input.variantId) ||
        slabCategory?.variants[0];
      const widthVal = activeVariant?.widthMeters || 1.2;
      const areaOfOne = Number((widthVal * (isValidLength ? lengthVal : 2.9)).toFixed(2));
      const totalAreaVal = Number(((input.quantity || 1) * areaOfOne).toFixed(2));
      const slabVariants = slabCategory?.variants || [];

      return (
        <div className="flex flex-col gap-5">
          {/* Panel Type Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              {t("inputs.panelType")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slabVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChangeInput({ ...input, variantId: v.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    input.variantId === v.id
                      ? "bg-primary-yellow/10 border-primary-yellow text-primary-yellow shadow-lg shadow-primary-yellow/5"
                      : "bg-background/60 border-gold-border/60 text-text-secondary hover:border-gold-border hover:text-text-primary"
                  }`}
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-wider mb-1">
                    {t(`blocks.${v.nameKey}`)}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {t("inputs.width")}: {v.widthMeters} {t("units.m")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel Length & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <CalculatorField
                id="slab-length"
                label={t("inputs.panelLength")}
                type="number"
                value={input.lengthMeters}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeInput({
                    ...input,
                    lengthMeters: isNaN(val) ? 2.9 : val,
                  });
                }}
                min={2.9}
                max={6.3}
                step={0.1}
                suffix="m"
              />
              <span className="text-[11px] font-mono text-text-muted">
                {t("inputs.lengthRangeHint")}
              </span>
              {!isValidLength && (
                <span className="text-xs font-mono text-red-400 font-semibold">
                  ⚠ {t("inputs.lengthValidationError")}
                </span>
              )}
            </div>

            <CalculatorField
              id="slab-quantity"
              label={t("inputs.quantity")}
              type="number"
              value={input.quantity}
              onChange={(e) =>
                onChangeInput({
                  ...input,
                  quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              min={1}
              step={1}
              suffix="pcs"
            />
          </div>

          {/* Real-time Calculated Metrics Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-gold-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted text-[11px] uppercase tracking-wider">
                {t("results.areaOfOnePanel")}:
              </span>
              <span className="text-text-primary font-bold text-base">
                {areaOfOne} {t("units.m2")}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted text-[11px] uppercase tracking-wider">
                {t("results.totalArea")}:
              </span>
              <span className="text-primary-yellow font-bold text-base">
                {totalAreaVal} {t("units.m2")}
              </span>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
