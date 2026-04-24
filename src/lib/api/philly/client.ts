// ============================================
// Philadelphia City API Client
// Free, no authentication required
// ============================================

import type {
  PhillyViolation,
  PhillyBusinessLicense,
  PhillyOPAProperty,
  PhillyLeadCert,
  PhillyCAL,
  ComplianceReport,
} from "@/types";

const CARTO_BASE = "https://phl.carto.com/api/v2/sql";
const ARCGIS_BASE =
  "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services";

// --- Helper: normalize address for Philly queries ---
function normalizeAddress(address: string): string {
  return address
    .toUpperCase()
    .trim()
    .replace(/,.*$/, "") // strip city/state/zip
    .replace(/\s+(PHILADELPHIA|PHILA|PA|PA\s*\d+).*$/i, "")
    .replace(/\bSTREET\b/g, "ST")
    .replace(/\bAVENUE\b/g, "AVE")
    .replace(/\bBOULEVARD\b/g, "BLVD")
    .replace(/\bDRIVE\b/g, "DR")
    .replace(/\bLANE\b/g, "LN")
    .replace(/\bROAD\b/g, "RD")
    .replace(/\bCOURT\b/g, "CT")
    .replace(/\bPLACE\b/g, "PL")
    .replace(/\bTERRACE\b/g, "TER")
    .replace(/\bCIRCLE\b/g, "CIR")
    .replace(/\bNORTH\b/g, "N")
    .replace(/\bSOUTH\b/g, "S")
    .replace(/\bEAST\b/g, "E")
    .replace(/\bWEST\b/g, "W")
    .replace(/\./g, "")
    .trim();
}

// --- Upstream API error with retry-on-5xx ---
// Philly's CARTO and ArcGIS both occasionally return 502/503 under load.
// A single retry after 500ms catches the vast majority of transient failures.
export class UpstreamPhillyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "UpstreamPhillyError";
  }
}

async function fetchWithRetry(url: string, label: string): Promise<Response> {
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    lastRes = res;
    // Only retry on 5xx (server / infra errors). 4xx = request problem, won't self-heal.
    if (res.status < 500 || res.status >= 600) break;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
  }
  throw new UpstreamPhillyError(
    lastRes?.status ?? 500,
    `${label} error: ${lastRes?.status ?? "unknown"} ${lastRes?.statusText ?? ""}`
  );
}

// --- CARTO SQL Query ---
async function cartoQuery<T>(sql: string): Promise<T[]> {
  const url = `${CARTO_BASE}?q=${encodeURIComponent(sql)}`;
  const res = await fetchWithRetry(url, "CARTO API");
  const data = await res.json();
  return data.rows as T[];
}

// --- ArcGIS Feature Query ---
async function arcgisQuery<T>(
  serviceName: string,
  where: string,
  outFields = "*"
): Promise<T[]> {
  const url = `${ARCGIS_BASE}/${serviceName}/FeatureServer/0/query?where=${encodeURIComponent(where)}&outFields=${outFields}&f=json`;
  const res = await fetchWithRetry(url, "ArcGIS API");
  const data = await res.json();
  return (data.features || []).map(
    (f: { attributes: T }) => f.attributes
  ) as T[];
}

// ============================================
// Public API Functions
// ============================================

/**
 * Get all violations for an address
 */
export async function getViolations(
  address: string
): Promise<PhillyViolation[]> {
  const normalized = normalizeAddress(address);
  return cartoQuery<PhillyViolation>(
    `SELECT * FROM violations WHERE address = '${normalized}' ORDER BY violationdate DESC`
  );
}

/**
 * Get only OPEN violations for an address
 */
export async function getOpenViolations(
  address: string
): Promise<PhillyViolation[]> {
  const normalized = normalizeAddress(address);
  return cartoQuery<PhillyViolation>(
    `SELECT * FROM violations WHERE address LIKE '${normalized.replace(/'/g, "''")}%' AND violationstatus = 'OPEN' ORDER BY violationdate DESC`
  );
}

/**
 * Get rental license status from business_licenses table
 */
export async function getRentalLicense(
  address: string
): Promise<PhillyBusinessLicense[]> {
  const normalized = normalizeAddress(address);
  return cartoQuery<PhillyBusinessLicense>(
    `SELECT * FROM business_licenses WHERE address LIKE '${normalized.replace(/'/g, "''")}%' AND LOWER(licensetype) LIKE '%rental%' ORDER BY mostrecentissuedate DESC LIMIT 5`
  );
}

/**
 * Autocomplete search against OPA addresses — for address typeahead.
 * Returns up to 10 matching locations.
 *
 * Philly OPA stores multi-lot parcels as "1600-18 WALNUT ST" (hyphenated
 * ranges), so a plain prefix on "1600 WALNUT" would miss them. We split the
 * input into a leading number part and a street part and match each side,
 * which catches both "1600 WALNUT ST" and "1600-18 WALNUT ST".
 */
export async function searchOPAAddresses(query: string): Promise<string[]> {
  const normalized = normalizeAddress(query);
  if (normalized.length < 3) return [];
  const escaped = normalized.replace(/'/g, "''");

  // If the query starts with digits, split on the first space so we can match
  // number-prefix + street-contains independently.
  const leadingNumberMatch = escaped.match(/^(\d+)\s+(.+)$/);
  let sql: string;
  if (leadingNumberMatch) {
    const num = leadingNumberMatch[1];
    const rest = leadingNumberMatch[2];
    sql = `
      SELECT DISTINCT location FROM opa_properties_public
      WHERE location LIKE '${num}%'
        AND location LIKE '%${rest}%'
      ORDER BY location LIMIT 10
    `;
  } else {
    // No leading number — treat as street-name search (contains).
    sql = `
      SELECT DISTINCT location FROM opa_properties_public
      WHERE location LIKE '%${escaped}%'
      ORDER BY location LIMIT 10
    `;
  }

  try {
    const rows = await cartoQuery<{ location: string }>(sql.replace(/\s+/g, " ").trim());
    return rows.map((r) => r.location).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Get OPA property data (ownership, year built, bedrooms, etc.)
 */
export async function getOPAProperty(
  address: string
): Promise<PhillyOPAProperty[]> {
  const normalized = normalizeAddress(address);
  // Use LIKE for flexible matching (handles unit variations)
  return cartoQuery<PhillyOPAProperty>(
    `SELECT * FROM opa_properties_public WHERE location LIKE '${normalized.replace(/'/g, "''")}%' LIMIT 5`
  );
}

/**
 * Get Commercial Activity License
 */
export async function getCommercialActivityLicense(
  ownerName?: string
): Promise<PhillyCAL[]> {
  // CAL table has no address column — must search by owner name
  if (!ownerName) return [];
  const normalized = ownerName.toUpperCase().trim();
  try {
    return await cartoQuery<PhillyCAL>(
      `SELECT * FROM com_act_licenses WHERE UPPER(legalfirstname || ' ' || legallastname) = '${normalized}' OR UPPER(companyname) = '${normalized}' ORDER BY issuedate DESC LIMIT 5`
    );
  } catch {
    return []; // Non-fatal — CAL lookup is best-effort
  }
}

/**
 * Get lead paint certification from ArcGIS
 */
export async function getLeadCertification(
  opaAccountNum: string
): Promise<PhillyLeadCert[]> {
  // LHHP dataset uses 'opa_account' field
  return arcgisQuery<PhillyLeadCert>(
    "lhhp_lead_certifications",
    `opa_account = '${opaAccountNum}'`,
    "lhhp_certification_status,lhhp_status_type,lhhp_cert_date,lhhp_cert_expiration_date,lhhp_status_details,opa_year_built,address"
  );
}

// ============================================
// Full Compliance Report
// ============================================

/**
 * Run all city checks for a property address and return a unified compliance report
 */
export async function getComplianceReport(
  address: string
): Promise<ComplianceReport> {
  const normalized = normalizeAddress(address);

  // Phase 1: Run OPA + violations + rental license in parallel
  const [opaResults, violations, rentalLicenses] =
    await Promise.all([
      getOPAProperty(normalized),
      getOpenViolations(normalized),
      getRentalLicense(normalized),
    ]);

  const opaData = opaResults[0] || null;

  // Phase 2: CAL (needs owner name) + Lead cert (needs parcel) in parallel
  const opaOwnerName = opaData?.owner_1 || opaData?.owner_2 || undefined;
  const parcelNumber = opaData?.parcel_number || null;

  const [calResults, leadResults] = await Promise.all([
    getCommercialActivityLicense(opaOwnerName),
    parcelNumber ? getLeadCertification(parcelNumber) : Promise.resolve([]),
  ]);

  const leadCert = leadResults[0] || null;

  const yearBuilt = parseInt(String(opaData?.year_built || "0"), 10) || 0;
  const leadRequired = yearBuilt > 0 && yearBuilt <= 1978;

  // Handle LHHP date fields (epoch milliseconds from ArcGIS)
  const leadCertExpiration = leadCert?.lhhp_cert_expiration_date
    ? new Date(leadCert.lhhp_cert_expiration_date)
    : leadCert?.cert_expiration
    ? new Date(leadCert.cert_expiration)
    : null;
  const leadExpired = leadCertExpiration ? leadCertExpiration < new Date() : false;

  const activeLicense =
    rentalLicenses.find(
      (l) =>
        l.licensestatus?.toUpperCase() === "ACTIVE" ||
        l.licensestatus?.toUpperCase() === "ISSUED"
    ) || null;

  const activeCAL =
    calResults.find(
      (l) =>
        l.licensestatus?.toUpperCase() === "ACTIVE" ||
        l.licensestatus?.toUpperCase() === "ISSUED"
    ) || null;

  // Build blockers list
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (violations.length > 0) {
    blockers.push(
      `${violations.length} open violation(s) — must be resolved before licensing`
    );
  }
  if (!activeCAL) {
    blockers.push("No active Commercial Activity License found");
  }
  if (leadRequired && !leadCert) {
    blockers.push(
      `Property built in ${yearBuilt} (pre-1978) — Lead Safe/Free certification required but not found`
    );
  } else if (leadRequired && leadExpired) {
    blockers.push("Lead certification is expired — renewal required");
  } else if (leadRequired && leadCert?.lhhp_certification_status === "Certified") {
    // Has valid cert — no blocker
  } else if (leadRequired && leadCert?.lhhp_certification_status === "Exempt") {
    // Exempt (e.g., "Built after 1978" per LHHP) — no blocker
  }
  if (!opaData) {
    warnings.push(
      "Property not found in OPA records — verify address format"
    );
  }
  if (activeLicense) {
    const exp = new Date(activeLicense.expirationdate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (exp < thirtyDaysFromNow) {
      warnings.push(
        `Rental license expires ${activeLicense.expirationdate} — renewal needed soon`
      );
    }
  }

  // Calculate readiness score
  let score = 100;
  score -= blockers.length * 25;
  score -= warnings.length * 10;
  if (score < 0) score = 0;

  return {
    address: normalized,
    checkedAt: new Date().toISOString(),
    opaData,
    violations: {
      open: violations,
      total: violations.length,
      hasOpenViolations: violations.length > 0,
    },
    rentalLicense: {
      active: activeLicense,
      hasActiveLicense: !!activeLicense,
      expirationDate: activeLicense?.expirationdate || null,
    },
    commercialActivityLicense: {
      active: activeCAL,
      hasActiveCAL: !!activeCAL,
    },
    leadCertification: {
      cert: leadCert,
      required: leadRequired,
      hasCert: !!leadCert,
      expired: leadExpired,
    },
    readinessScore: score,
    blockers,
    warnings,
  };
}
