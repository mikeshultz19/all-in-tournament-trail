export function launchFlightLabel(boatNumber: number): string {
  if (!Number.isInteger(boatNumber) || boatNumber < 1) {
    throw new Error("Boat number must be a positive integer.");
  }

  return `Flight ${Math.floor((boatNumber - 1) / 25) + 1}`;
}
