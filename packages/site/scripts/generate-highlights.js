#!/usr/bin/env node
// @ts-check

import { writeFile } from "node:fs/promises";
import hljs from "highlight.js";

/** @typedef {import("highlight.js").Mode} Mode */

/** @type {<T>(it: T | T[] | undefined | null) => T[]} */
function asArray(it) {
  if (!it) return [];
  if (Array.isArray(it)) return it;
  return [it];
}

/** @type {(mode: Mode, scanned?: Set<unknown>) => string[]} */
function findDependencies(mode, scanned = new Set()) {
  if (scanned.has(mode)) {
    return asArray(mode.subLanguage);
  } else {
    scanned.add(mode);
  }

  return [
    ...asArray(mode.subLanguage),
    .../** @type unknown[] */ (Object.values(mode))
      .filter((it) => typeof it === "object")
      .flatMap((it) => asArray(it))
      .flatMap((it) => findDependencies(/** @type {Mode} */ (it), scanned)),
  ];
}

const languages = [];

for (const name of hljs.listLanguages()) {
  const language = hljs.getLanguage(name);
  if (!language) throw new Error("Unreachable");
  const names = [...new Set([name, ...asArray(language.aliases)])];
  const dependencies = findDependencies(language)
    .filter((it) => !names.includes(it))
    .filter((it, index, array) => array.indexOf(it) === index);
  languages.push({
    name,
    names,
    dependencies,
  });
}

let code = `
// @generated
// This file is generated with site/scripts/generate-highlighting.js
// Do not edit directly, please edit the script instead.

import type { HLJSApi } from "highlight.js";
import hljs_ from "highlight.js";
import "~/styles/hljs.css";

let hljs = hljs_;

const registeredLanguages: string[] = [];

const languageModules = new Map([
`;
for (const language of languages) {
  code += `[${JSON.stringify(language.name)},`;
  code += `() => import("highlight.js/lib/languages/${language.name}")],`;
}
code += `
]);

const languageAliases = new Map(
  [
`;
for (const language of languages) {
  if (language.names.length > 1) {
    code += `${JSON.stringify(language.names.join(" "))},`;
  }
}
code += `
  ].flatMap((it) => {
    const [name, ...aliases] = it.split(" ");
    return aliases.map((it) => [it, name] as const);
  }),
);

const languageDependencies = new Map(
  [
`;

for (const language of languages) {
  if (language.dependencies.length === 0) continue;
  code += JSON.stringify(`${language.name} ${language.dependencies.join(" ")}`);
  code += ",";
}

code += `
  ].map((it) => {
    const [name, ...deps] = it.split(" ");
    return [name, deps] as const;
  }),
);

async function registerLanguage(hljs: HLJSApi, language: string) {
  async function register(language: string) {
    if (hljs.getLanguage(language)) return;
    const importModule = languageModules.get(language);
    if (!importModule) return;
    const module = await importModule();
    hljs.registerLanguage(language, module.default);
    registeredLanguages.push(language);
  }

  const languages = [language];
  const scanned = new Set<string>();

  function findAndRegisterDependencies(language: string) {
    if (scanned.has(language)) return;
    scanned.add(language);

    const dependencies = languageDependencies.get(language);
    for (const dependency of dependencies ?? []) {
      languages.push(dependency);
      findAndRegisterDependencies(dependency);
    }
  }
  findAndRegisterDependencies(language);

  await Promise.all(languages.map((it) => register(it)));
  registeredLanguages.push(...languages);
}

export function highlightCode(content: string, language?: string) {
  if (import.meta.server) return;

  if (!language) return;
  const name = languageAliases.get(language) ?? language;
  if (!languageModules.has(name)) return;

  if (!hljs) {
    import("highlight.js/lib/core").then((module) => {
      hljs = module.default;
    });
    return;
  }

  if (!registeredLanguages.includes(name)) {
    registerLanguage(hljs, name);
    return;
  }

  return hljs.highlight(content, {
    language: name,
    ignoreIllegals: true,
  });
}
`;

await writeFile(
  new URL("../app/util/highlighting.ts", import.meta.url).pathname,
  code,
);
