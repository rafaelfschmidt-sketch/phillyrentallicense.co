// ============================================
// Rental License Process — Type Definitions
// ============================================

export type RentalLicenseStatus =
  | "intake"           // Form just submitted
  | "awaiting_phtin"   // Waiting on owner for Philadelphia Tax ID
  | "tax_clearance"    // Verifying tax clearance
  | "blocked"          // Blocked by violations, tax issues, etc.
  | "in_progress"      // Moving through steps
  | "ready_to_submit"  // All prerequisites met, ready for Eclipse
  | "submitted"        // Submitted in Eclipse, waiting on L&I
  | "completed";       // License issued

export type StepStatus = "pending" | "active" | "completed" | "blocked" | "skipped";

export interface RentalLicenseStep {
  id: string;
  name: string;
  status: StepStatus;
  completedAt?: string;
  blocker?: string;
}

export interface ApplicationNote {
  author: string;
  content: string;
  createdAt: string;
}

export interface RentalLicenseApplication {
  id: string;
  propertyAddress: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyType: "single-family" | "multifamily";
  status: RentalLicenseStatus;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  steps: RentalLicenseStep[];
  complianceCheck: ComplianceSnapshot | null;
  phtin: string | null;
  notes: ApplicationNote[];
}

export interface ComplianceSnapshot {
  checkedAt: string;
  hasOpenViolations: boolean;
  openViolationCount: number;
  hasActiveRentalLicense: boolean;
  rentalLicenseExpiration: string | null;
  hasActiveCAL: boolean;
  leadCertRequired: boolean;
  hasLeadCert: boolean;
  leadCertExpired: boolean;
  yearBuilt: number | null;
  opaOwner: string | null;
  readinessScore: number;
  blockers: string[];
}

// Intake form data — what the owner fills out (replaces Jotform)
export interface RentalLicenseIntakeData {
  // Owner info
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerMailingAddress: string;
  ownerEin?: string;

  // Property info
  propertyAddress: string;
  propertyUnit?: string;
  propertyType: "single-family" | "multifamily";
  numberOfUnits?: number;

  // Tax info
  hasPhillyTaxId: boolean;
  phillyTaxId?: string;

  // Service type
  serviceType: "managed" | "license_only" | "leasing_only";
}
