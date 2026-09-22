/**
 * GitHub Pages serves the site from /<repo>, so every static asset URL needs the
 * same prefix that next.config.ts feeds into `basePath`. Plain <img> tags don't
 * get it for free the way next/link and next/image do.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return `${basePath}${path}`;
}
