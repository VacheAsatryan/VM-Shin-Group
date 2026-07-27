import { VM_SHIN_GROUP_FACTORY_COORDINATES } from "@/lib/maps/mapConstants";

export interface FactoryOriginConfig {
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const FACTORY_ORIGIN: FactoryOriginConfig = {
  name: "VM Shin Group Production Plant",
  address: "Yerevan Highway 12/4",
  city: "Armavir",
  region: "Armavir Province",
  country: "Armenia",
  coordinates: {
    lat: VM_SHIN_GROUP_FACTORY_COORDINATES[0],
    lng: VM_SHIN_GROUP_FACTORY_COORDINATES[1],
  },
};

// Temporary test tariff for delivery price testing
export const DELIVERY_CONFIG = {
  costPerKm: 300,
  isTemporaryTestTariff: true,
  currency: "AMD",
};
