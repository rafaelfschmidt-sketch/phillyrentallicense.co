// ============================================
// Google Drive — Folder Creation for Rental License Clients
// ============================================
// Requires a Google Service Account with access to the parent folder.
// Set GOOGLE_SERVICE_ACCOUNT_KEY as a JSON string in your environment.
// Share the parent folder with the service account email (Editor access).

import { google } from "googleapis";

const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_RENTAL_LICENSE_FOLDER_ID || "1AealrhvXN4MHWR1B3BDOpD8cKRC-n2b9";

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    console.warn("GOOGLE_SERVICE_ACCOUNT_KEY not set — skipping Drive operations");
    return null;
  }

  try {
    const key = JSON.parse(keyJson);
    return new google.auth.GoogleAuth({
      credentials: key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  } catch (err) {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:", err);
    return null;
  }
}

/**
 * Create a folder in Google Drive inside the rental license parent folder.
 * Folder name format: "123 N BROAD ST - John Smith"
 * Returns the folder URL or null if creation failed.
 * Supports both regular Drive and Shared Drives.
 */
export async function createClientFolder(
  propertyAddress: string,
  ownerName: string
): Promise<{ folderId: string; folderUrl: string } | null> {
  const auth = getAuth();
  if (!auth) return null;

  const drive = google.drive({ version: "v3", auth });
  const folderName = `${propertyAddress} - ${ownerName}`;

  try {
    // Check if folder already exists (avoid duplicates)
    // Use includeItemsFromAllDrives + supportsAllDrives for Shared Drive support
    const existing = await drive.files.list({
      q: `name = '${folderName.replace(/'/g, "\\'")}' and '${PARENT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, webViewLink)",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    if (existing.data.files && existing.data.files.length > 0) {
      const file = existing.data.files[0];
      return {
        folderId: file.id!,
        folderUrl: file.webViewLink || `https://drive.google.com/drive/folders/${file.id}`,
      };
    }

    // Create the folder (supportsAllDrives for Shared Drive)
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [PARENT_FOLDER_ID],
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    const folderId = response.data.id!;
    const folderUrl = response.data.webViewLink || `https://drive.google.com/drive/folders/${folderId}`;

    return { folderId, folderUrl };
  } catch (err) {
    console.error("Failed to create Google Drive folder:", err);
    return null;
  }
}
