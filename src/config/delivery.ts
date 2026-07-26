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

export const DELIVERY_CONFIG = {
  baseCost: 5000, // Demo base loading fee in AMD
  costPerKm: 350,  // Demo rate per kilometer in AMD
  defaultDistanceKm: 25, // Demo distance in km
  currency: "AMD",
  isDemoDelivery: true,
};
