export const normalizeGoogleDrivePreviewLink = (raw?: string | null): string | null => {
  if (!raw) return null;

  const value = raw.trim();
  if (!value) return null;

  if (value.includes("<iframe")) {
    const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    return normalizeGoogleDrivePreviewLink(match?.[1] ?? null);
  }

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const isGoogleDriveHost = ["drive.google.com", "docs.google.com"].includes(url.hostname);

    if (!isGoogleDriveHost) {
      return value;
    }

    const fileIdFromPath = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    const fileIdFromQuery = url.searchParams.get("id");
    const fileId = fileIdFromPath || fileIdFromQuery;

    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    if (url.pathname.endsWith("/preview")) {
      return value;
    }

    return value;
  } catch {
    return value;
  }
};

export const isGoogleDrivePreviewLink = (raw?: string | null) => {
  const normalized = normalizeGoogleDrivePreviewLink(raw);
  return !!normalized && normalized.includes("drive.google.com/file/d/") && normalized.endsWith("/preview");
};
