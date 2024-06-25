import matter from "front-matter";
import { readFile, readdir, writeFile } from "node:fs/promises";

(async () => {
  // Assume only one layer of nesting
  const folders = {
    _index: [],
  };
  const root = "public/guide-files";
  const contents = await readdir(root, {
    recursive: true,
    withFileTypes: true,
  });
  for (const dirent of contents) {
    if (dirent.isFile()) {
      if (!dirent.name.endsWith(".md")) continue;

      const path = `${dirent.path}/${dirent.name}`;
      const file = await readFile(path, {
        encoding: "utf8",
      });
      const data = matter(file).attributes;

      const key =
        dirent.path.replace(root, "").replace(/^\//, "").trim() || "_index";
      folders[key] = folders[key] ?? [];
      folders[key].push({ ...data, file: dirent.name.replace(/\.md$/, "") });
    }
  }

  await writeFile("public/guide-index.json", JSON.stringify(folders));
  console.log("Wrote index of", contents.length, "items (directories included)");
})();
