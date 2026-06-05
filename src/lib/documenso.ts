// ============================================================================
// Documenso integration stub
// ============================================================================
// The route at src/app/api/rental-license/generate-rlsi/route.ts imports
// these symbols expecting a real Documenso API client. That integration
// hasn't been built yet — the route is currently orphaned (no UI calls it).
//
// This file exists solely so the build can resolve the imports. Every
// function throws at runtime; replace each with a real implementation when
// wiring Documenso for the RLSI flow.
// ============================================================================

const NOT_IMPLEMENTED =
  "Documenso integration is not implemented yet. Replace src/lib/documenso.ts with a real client before calling this route.";

// Template + recipient + field IDs would come from the Documenso dashboard
// once the RLSI template is created.
export const RLSI_TEMPLATE_ID = 0;

export const RLSI_RECIPIENT_IDS = {
  owner_1: 0,
  owner_2: 0,
};

export const RLSI_FIELDS: Array<{ id: number; name: string }> = [];

export type DocumensoField = { id: number; value: string };
export type DocumensoRecipient = { id: number; email: string; name: string };
export type DocumensoDocument = {
  id: number;
  recipients?: Array<{ id: number; email: string }>;
};

export async function createDraft(
  _templateId: number,
  _recipients: DocumensoRecipient[],
  _fields: DocumensoField[],
  _title: string,
): Promise<{ id: number }> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function deleteRecipient(_recipientId: number): Promise<boolean> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function getDocument(_id: number): Promise<DocumensoDocument> {
  throw new Error(NOT_IMPLEMENTED);
}

export function getDocumentUrl(_id: number): string {
  throw new Error(NOT_IMPLEMENTED);
}

export function buildPrefill(
  _values: Record<string, string>,
  _fields: Array<{ id: number; name: string }>,
): DocumensoField[] {
  throw new Error(NOT_IMPLEMENTED);
}
