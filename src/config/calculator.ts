export interface BlockOption {
  id: string;
  nameKey: string;
  lengthMeters: number;
  heightMeters: number;
  thicknessCm: number;
  blocksPerPallet: number;
}

export const BLOCK_OPTIONS: BlockOption[] = [
  {
    id: "pemzablok-20",
    nameKey: "block20",
    lengthMeters: 0.4,
    heightMeters: 0.2,
    thicknessCm: 20,
    blocksPerPallet: 60,
  },
  {
    id: "pemzablok-25",
    nameKey: "block25",
    lengthMeters: 0.4,
    heightMeters: 0.2,
    thicknessCm: 25,
    blocksPerPallet: 50,
  },
  {
    id: "pemzablok-30",
    nameKey: "block30",
    lengthMeters: 0.4,
    heightMeters: 0.2,
    thicknessCm: 30,
    blocksPerPallet: 40,
  },
];

export const CALCULATOR_DEFAULTS = {
  lengthMeters: 10,
  heightMeters: 3,
  selectedBlockId: "pemzablok-20",
  wasteFactor: 1.05, // 5% allowance for joint spacing & trimming
};
