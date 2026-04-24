// ============================================
// HubKey Hub — Core Type Definitions
// ============================================

// --- Property Types ---

export interface Property {
  id: string;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  propertyType: "single-family" | "multifamily";
  yearBuilt?: number;
  bedrooms?: number;
  bathrooms?: number;
  opaAccountNumber?: string;
  buildiumPropertyId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mailingAddress?: string;
  ein?: string;
  phillyTaxId?: string; // PHTIN
  buildiumOwnerId?: string;
}

// --- Philly City API Types ---

export interface PhillyViolation {
  casenumber: string;
  casecreateddate: string;
  casecompleteddate: string | null;
  casestatus: string;
  casetype: string;
  violationnumber: string;
  violationdate: string;
  violationcode: string;
  violationcodetitle: string;
  violationstatus: string;
  violationresolutiondate: string | null;
  violationresolutioncode: string | null;
  address: string;
  opa_account_num: string;
  opa_owner: string;
  lat: number;
  lng: number;
}

export interface PhillyBusinessLicense {
  licensetype: string;
  licensenum: string;
  licensestatus: string;
  legalname: string;
  address: string;
  initialissuedate: string;
  expirationdate: string;
  mostrecentissuedate: string;
  opa_account_num: string;
  unit_num: string | null;
  numberofunits: number | null;
}

export interface PhillyOPAProperty {
  parcel_number: string;
  location: string;
  owner_1: string;
  owner_2: string | null;
  mailing_address_1: string;
  mailing_street: string;
  mailing_city_state: string;
  market_value: number;
  sale_date: string;
  sale_price: number;
  year_built: number;
  category_code_description: string;
  building_code_description: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  total_livable_area: number;
  zoning: string;
}

export interface PhillyLeadCert {
  // ArcGIS LHHP fields
  opa_account?: string;
  address?: string;
  lhhp_certification_status?: string;
  lhhp_status_type?: string;
  lhhp_cert_date?: number; // epoch milliseconds
  lhhp_cert_expiration_date?: number; // epoch milliseconds
  lhhp_status_details?: string;
  opa_year_built?: string;
  // Legacy field names (for backward compat)
  opa_account_num?: string;
  cert_type?: string;
  cert_number?: string;
  cert_date?: string;
  cert_expiration?: string;
  status?: string;
}

export interface PhillyCAL {
  licensenum: string;
  licensestatus: string;
  legalname: string;
  address: string;
  initialissuedate: string;
  expirationdate: string;
}

// --- Compliance Report ---

export interface ComplianceReport {
  address: string;
  checkedAt: string;
  opaData: PhillyOPAProperty | null;
  violations: {
    open: PhillyViolation[];
    total: number;
    hasOpenViolations: boolean;
  };
  rentalLicense: {
    active: PhillyBusinessLicense | null;
    hasActiveLicense: boolean;
    expirationDate: string | null;
  };
  commercialActivityLicense: {
    active: PhillyCAL | null;
    hasActiveCAL: boolean;
  };
  leadCertification: {
    cert: PhillyLeadCert | null;
    required: boolean; // true if year_built <= 1978
    hasCert: boolean;
    expired: boolean;
  };
  readinessScore: number; // 0-100
  blockers: string[];
  warnings: string[];
}

// --- Workflow Engine Types ---

export type WorkflowStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";

export type StepStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "blocked";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStepTemplate[];
  roles: string[];
}

export interface WorkflowStepTemplate {
  id: string;
  order: number;
  title: string;
  description: string;
  assignedRole: string;
  type: "manual" | "automated" | "email" | "approval" | "api_check";
  blockedBy?: string[]; // step IDs that must complete first
  automationConfig?: {
    apiCall?: string;
    emailTemplate?: string;
  };
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  propertyId: string;
  status: WorkflowStatus;
  currentStepId: string | null;
  steps: WorkflowStepInstance[];
  startedAt: string;
  completedAt: string | null;
  assignedTo: string | null;
  notes: ActivityNote[];
}

export interface WorkflowStepInstance {
  id: string;
  templateStepId: string;
  order: number;
  title: string;
  description: string;
  status: StepStatus;
  assignedTo: string | null;
  assignedRole: string;
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
  blockers: string[];
}

export interface ActivityNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  type: "note" | "status_change" | "email_sent" | "api_check" | "system";
}

// --- Dashboard Types ---

export interface DashboardStats {
  totalProperties: number;
  activeWorkflows: number;
  blockedWorkflows: number;
  completedThisMonth: number;
  complianceAlerts: number;
}

export interface ProcessOverview {
  templateName: string;
  total: number;
  inProgress: number;
  blocked: number;
  completed: number;
}
