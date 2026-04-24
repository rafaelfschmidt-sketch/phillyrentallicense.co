// ============================================
// Rental License Pricing — License Only Clients
// ============================================

// Service fees by rental-license service type.
// Matches the `service_type` Postgres enum in 20260325_001_rental_license_tables.sql.
// NOTE: `tenant_placement` is a lease-workflow concept (see /admin/leasing), not a rental
// license service type. Don't add it here — it would fail the DB CHECK constraint.
export const SERVICE_FEES: Record<string, number> = {
  license_only: 50000,  // $500.00 — standalone rental license (full price)
  leasing_only: 25000,  // $250.00 — discounted rental license for existing HubKey leasing clients
};

// Default service fee (license only)
export const SERVICE_FEE_CENTS = 50000; // $500.00

// Per-unit license fee
export const LICENSE_FEE_PER_UNIT_CENTS = 6900; // $69.00

// Lead paint test pricing (retail price — billed to client)
// Only applies to properties built 1978 or earlier
const LEAD_PAINT_PRICES: Record<number, number> = {
  0: 13000,  // Studio — $130
  1: 16000,  // 1 BR — $160
  2: 19500,  // 2 BR — $195
  3: 22000,  // 3 BR — $220
  4: 25500,  // 4 BR — $255
  5: 28000,  // 5 BR — $280
};

export function getLeadPaintFeeCents(bedroomCount: number): number {
  if (bedroomCount >= 5) return LEAD_PAINT_PRICES[5];
  return LEAD_PAINT_PRICES[bedroomCount] ?? LEAD_PAINT_PRICES[5];
}

export interface UnitInput {
  label: string;
  bedroomCount: number;
}

export interface PriceBreakdown {
  serviceFee: number;
  licenseFee: number;
  leadPaintFee: number;
  leadPaintPerUnit: { label: string; bedroomCount: number; fee: number }[];
  total: number;
  leadPaintRequired: boolean;
}

export function calculatePrice(
  units: UnitInput[],
  leadPaintRequired: boolean,
  serviceType: string = "license_only"
): PriceBreakdown {
  const serviceFee = SERVICE_FEES[serviceType] ?? SERVICE_FEE_CENTS;
  const licenseFee = LICENSE_FEE_PER_UNIT_CENTS * units.length;

  const leadPaintPerUnit = units.map((u) => ({
    label: u.label,
    bedroomCount: u.bedroomCount,
    fee: leadPaintRequired ? getLeadPaintFeeCents(u.bedroomCount) : 0,
  }));

  const leadPaintFee = leadPaintPerUnit.reduce((sum, u) => sum + u.fee, 0);

  return {
    serviceFee,
    licenseFee,
    leadPaintFee,
    leadPaintPerUnit,
    total: serviceFee + licenseFee + leadPaintFee,
    leadPaintRequired,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
