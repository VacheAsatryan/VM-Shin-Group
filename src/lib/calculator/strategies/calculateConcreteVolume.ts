import type { ConcreteVolumeInput, CalculationMetrics } from "../calculator.types";

export function calculateConcreteVolume(
  input: ConcreteVolumeInput
): CalculationMetrics {
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  let rawVolumeM3 = 0;

  if (input.mode === "direct") {
    rawVolumeM3 = Math.max(0, input.directVolumeM3 || 0);
  } else {
    const l = Math.max(0, input.lengthMeters || 0);
    const w = Math.max(0, input.widthMeters || 0);
    const d = Math.max(0, input.depthMeters || 0);
    rawVolumeM3 = l * w * d;
  }

  const volumeM3 = Number((rawVolumeM3 * (1 + reserve)).toFixed(2));

  return {
    primaryQuantity: volumeM3,
    primaryUnitKey: "m3",
    volumeM3,
  };
}
