export type DocumentCategory = "equipment-verification" | "recognition";

export type CompanyDocument = {
  id: string;
  category: DocumentCategory;
  image: string;
  titleKey: string;
  descriptionKey: string;
  documentNumber?: string;
  equipmentModel?: string;
  capacity?: string;
  issueDate?: string;
  validUntil?: string;
  status?: "active" | "archived" | "unknown";
};

export const COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    id: "verification-sb210-2kg-145302",
    category: "equipment-verification",
    image: "/images/documents/equipment-verification/verification-certificate-sb210-2kg-145302.webp",
    titleKey: "items.verificationSb2102kg145302.title",
    descriptionKey: "items.verificationSb2102kg145302.description",
    documentNumber: "145302",
    equipmentModel: "SB 210",
    capacity: "2 kg",
    issueDate: "05.02.2025",
    validUntil: "05.02.2026",
    status: "archived",
  },
  {
    id: "verification-sb210-500g-145304",
    category: "equipment-verification",
    image: "/images/documents/equipment-verification/verification-certificate-sb210-500g-145304.webp",
    titleKey: "items.verificationSb210500g145304.title",
    descriptionKey: "items.verificationSb210500g145304.description",
    documentNumber: "145304",
    equipmentModel: "SB 210",
    capacity: "500 g",
    issueDate: "05.02.2025",
    validUntil: "05.02.2026",
    status: "archived",
  },
  {
    id: "verification-sb210-20kg-145306",
    category: "equipment-verification",
    image: "/images/documents/equipment-verification/verification-certificate-sb210-20kg-145306.webp",
    titleKey: "items.verificationSb21020kg145306.title",
    descriptionKey: "items.verificationSb21020kg145306.description",
    documentNumber: "145306",
    equipmentModel: "SB 210",
    capacity: "20 kg",
    issueDate: "05.02.2025",
    validUntil: "05.02.2026",
    status: "archived",
  },
  {
    id: "verification-sb210-160kg-145305",
    category: "equipment-verification",
    image: "/images/documents/equipment-verification/verification-certificate-sb210-160kg-145305.webp",
    titleKey: "items.verificationSb210160kg145305.title",
    descriptionKey: "items.verificationSb210160kg145305.description",
    documentNumber: "145305",
    equipmentModel: "SB 210",
    capacity: "160 kg",
    issueDate: "05.02.2025",
    validUntil: "05.02.2026",
    status: "archived",
  },
  {
    id: "appreciation-arstor-karine-85",
    category: "recognition",
    image: "/images/documents/awards/appreciation-arstor-karine-85.webp",
    titleKey: "items.appreciationArstorKarine85.title",
    descriptionKey: "items.appreciationArstorKarine85.description",
    status: "unknown",
  },
];
