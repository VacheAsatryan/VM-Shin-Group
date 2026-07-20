export interface ApplicationConfigItem {
  id: string;
  number: string;
  key: string;
  image: string;
}

export const APPLICATIONS: ApplicationConfigItem[] = [
  {
    id: "residential",
    number: "01",
    key: "residential",
    image: "/images/applications/placeholders/residential.svg",
  },
  {
    id: "industrial",
    number: "02",
    key: "industrial",
    image: "/images/applications/placeholders/industrial.svg",
  },
  {
    id: "road",
    number: "03",
    key: "road",
    image: "/images/applications/placeholders/road.svg",
  },
  {
    id: "landscape",
    number: "04",
    key: "landscape",
    image: "/images/applications/placeholders/landscape.svg",
  },
  {
    id: "publicBuilding",
    number: "05",
    key: "publicBuilding",
    image: "/images/applications/placeholders/public-building.svg",
  },
  {
    id: "commercial",
    number: "06",
    key: "commercial",
    image: "/images/applications/placeholders/commercial.svg",
  },
];
