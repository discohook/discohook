interface FileHost {
  id: string;
  name: string;
  maxSize: number;
  accept?: string[];
  deny?: string[];
}

export const fileHosts: FileHost[] = [
  {
    id: "imgbb",
    name: "ImgBB",
    // 64 for premium accounts, which we currently don't implement
    maxSize: 32 * 1000 * 1000,
    // allowed types extracted from input on main site
    // biome-ignore format: long
    accept: ["image/*", "application/pdf", "application/postscript", ".arw", ".avif", ".bmp", ".cr2", ".cr3", ".cur", ".cut", ".dcm", ".dds", ".dib", ".dng", ".emf", ".exr", ".fax", ".fig", ".fits", ".fpx", ".gbr", ".gd", ".gif", ".hdr", ".heic", ".heif", ".icns", ".ico", ".iff", ".ilbm", ".j2k", ".jpe", ".jpeg", ".jpg", ".jpf", ".jpm", ".jp2", ".jpx", ".jxl", ".miff", ".mng", ".mpo", ".nef", ".nrrd", ".orf", ".pbm", ".pcx", ".pdf", ".pgm", ".pic", ".pict", ".png", ".pnm", ".ppm", ".ps", ".psb", ".psd", ".qoi", ".raf", ".raw", ".rw2", ".sgi", ".sid", ".sr2", ".svg", ".tga", ".tif", ".tiff", ".vtf", ".webp", ".wmf", ".xbm", ".xcf", ".xpm", ".jpeg", ".tiff", ".heif"],
  },
  {
    id: "postimages",
    name: "Postimages",
    // 96 for premium accounts, which we currently don't implement
    maxSize: 32 * 1000 * 1000,
    accept: ["image/*"],
  },
  {
    id: "catbox",
    name: "Catbox",
    maxSize: 200 * 1000 * 1000,
    deny: [".exe", ".scr", ".cpl", ".doc", ".docx", ".jar"],
  },
  {
    id: "sxcu",
    name: "sxcu.net",
    maxSize: 95 * 1000 * 1000,
    // biome-ignore format: long
    accept: [".png", ".jpg", ".jpeg", ".gif", ".ico", ".bmp", ".tif", ".tiff", ".webm", ".webp"],
  },
  {
    id: "discord",
    name: "Discord",
    // depends on server boosts, we'll probably allow variance
    maxSize: 10 * 1000 * 1000,
  },
];

export interface FilehostUploadResponse {
  url: string;
  thumbnail_url?: string;
  delete_url?: string;
  width?: number;
  height?: number;
  expires_at?: number | null;
  mime: string;
}
