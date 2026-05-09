interface FileHost {
  client: boolean;
  name: string;
  maxSize: number;
  accept?: string[];
  deny?: string[];
}

export const fileHosts: FileHost[] = [
  {
    name: "ImgBB",
    // 64 for premium accounts, which we currently don't implement
    maxSize: 32 * 1000 * 1000,
    client: true,
    // allowed types extracted from input on main site
    // biome-ignore format: long
    accept: ["image/*", "application/pdf", "application/postscript", ".arw", ".avif", ".bmp", ".cr2", ".cr3", ".cur", ".cut", ".dcm", ".dds", ".dib", ".dng", ".emf", ".exr", ".fax", ".fig", ".fits", ".fpx", ".gbr", ".gd", ".gif", ".hdr", ".heic", ".heif", ".icns", ".ico", ".iff", ".ilbm", ".j2k", ".jpe", ".jpeg", ".jpg", ".jpf", ".jpm", ".jp2", ".jpx", ".jxl", ".miff", ".mng", ".mpo", ".nef", ".nrrd", ".orf", ".pbm", ".pcx", ".pdf", ".pgm", ".pic", ".pict", ".png", ".pnm", ".ppm", ".ps", ".psb", ".psd", ".qoi", ".raf", ".raw", ".rw2", ".sgi", ".sid", ".sr2", ".svg", ".tga", ".tif", ".tiff", ".vtf", ".webp", ".wmf", ".xbm", ".xcf", ".xpm", ".jpeg", ".tiff", ".heif"],
  },
  {
    name: "Catbox",
    maxSize: 200 * 1000 * 1000,
    // TODO: client?
    client: true,
    deny: [".exe", ".scr", ".cpl", ".doc", ".docx", ".jar"],
  },
  // I think imgur has removed the ability to upload cross origin, so we would
  // need a proxy endpoint. If imgur is highly requested then we might do that.
  // {
  //   name: "Imgur",
  //   // https://help.imgur.com/hc/en-us/articles/26511665959579
  //   // 200 for gifs, 50 for still images
  //   maxSize: 200 * 1000 * 1000,
  //   client: true,
  //   // biome-ignore format: long
  //   accept: [".png", ".jpg", ".jpeg", ".gif", ".tiff", ".mp4", ".mpeg", ".mpg", ".mpeg", ".avi", ".webm", ".mov", ".mkv", ".flv", "video/x-msvideo", ".wmv"],
  // },
  {
    name: "Discord",
    // depends on server boosts, we'll probably allow variance
    maxSize: 10 * 1000 * 1000,
    client: false,
  },
];
