"use client";

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { BLOCK_OPTIONS } from "@/config/calculator";
import type { CalculatorInput } from "@/lib/calculator/calculateMaterials";
import CalculatorField from "./CalculatorField";

interface CalculatorFormProps {
  input: CalculatorInput;
  onChange: (newInput: CalculatorInput) => void;
}

export default function CalculatorForm({ input, onChange }: CalculatorFormProps) {
  const t = useTranslations("calculator");

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = parseFloat(e.target.value);
    onChange({ ...input, lengthMeters: isNaN(val) ? 0 : val });
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = parseFloat(e.target.value);
    onChange({ ...input, heightMeters: isNaN(val) ? 0 : val });
  };

  const handleBlockChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...input, selectedBlockId: e.target.value });
  };

  const blockSelectOptions = BLOCK_OPTIONS.map((opt) => ({
    value: opt.id,
    label: t(`blocks.${opt.nameKey}`),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wall Length */}
        <CalculatorField
          id="calc-length"
          label={t("inputs.wallLength")}
          type="number"
          value={input.lengthMeters}
          onChange={handleLengthChange}
          min={0.1}
          max={500}
          step={0.5}
          suffix="m"
        />

        {/* Wall Height */}
        <CalculatorField
          id="calc-height"
          label={t("inputs.wallHeight")}
          type="number"
          value={input.heightMeters}
          onChange={handleHeightChange}
          min={0.1}
          max={100}
          step={0.1}
          suffix="m"
        />
      </div>

      {/* Block Type Selection */}
      <CalculatorField
        id="calc-block-type"
        label={t("inputs.blockType")}
        type="select"
        value={input.selectedBlockId}
        onChange={handleBlockChange}
        options={blockSelectOptions}
      />
    </div>
  );
}
