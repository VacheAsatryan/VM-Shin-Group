import { BLOCK_OPTIONS, CALCULATOR_DEFAULTS, type BlockOption } from "@/config/calculator";

export interface CalculatorInput {
  lengthMeters: number;
  heightMeters: number;
  selectedBlockId: string;
}

export interface CalculatorResultData {
  areaSqMeters: number;
  totalBlocks: number;
  totalPallets: number;
  selectedBlock: BlockOption;
}

/**
 * Isolated calculation logic for building material estimation.
 * Keeps business math decoupled from React UI components.
 */
export function calculateMaterials(input: CalculatorInput): CalculatorResultData {
  const length = Math.max(0, Number(input.lengthMeters) || 0);
  const height = Math.max(0, Number(input.heightMeters) || 0);
  const areaSqMeters = Number((length * height).toFixed(2));

  const selectedBlock =
    BLOCK_OPTIONS.find((b) => b.id === input.selectedBlockId) || BLOCK_OPTIONS[0];

  // Face area per block (e.g. 0.4m x 0.2m = 0.08 m²)
  const blockFaceArea = selectedBlock.lengthMeters * selectedBlock.heightMeters;

  const blocksPerSqMeter = blockFaceArea > 0 ? 1 / blockFaceArea : 0;
  const rawBlocks = areaSqMeters * blocksPerSqMeter * CALCULATOR_DEFAULTS.wasteFactor;
  const totalBlocks = Math.ceil(rawBlocks);

  const totalPallets =
    selectedBlock.blocksPerPallet > 0
      ? Math.ceil(totalBlocks / selectedBlock.blocksPerPallet)
      : 0;

  return {
    areaSqMeters,
    totalBlocks,
    totalPallets,
    selectedBlock,
  };
}
