import * as lightningcss from "lightningcss";
import { basename } from "node:path"; // eslint-disable-line unicorn/import-style
import * as terser from "terser";
import { createManifest } from "./manifest.config.ts";

const mode = Bun.env.NODE_ENV;
const dev = mode === "development";

// TODO: Use bun to bundle CSS once it's configurable e.g., targets, include.
async function compileCSS(path: string) {
  const source = await Bun.file(path).bytes();
  const result = await lightningcss.bundleAsync({
    filename: path,
    // @ts-expect-error - bundle does accept code, same as transform
    code: source,
    minify: !dev,
    // oxlint-disable-next-line no-bitwise
    targets: { chrome: 134 << 16 }, // matches manifest minimum_chrome_version
    include: lightningcss.Features.Nesting,
  });
  if (result.warnings.length > 0) console.error(result.warnings);
  return result.code;
}

async function makeThemes(pattern: string) {
  const themes: Record<string, string> = {};

  // oxlint-disable-next-line unicorn/no-array-sort
  for (const path of [...new Bun.Glob(pattern).scanSync()].sort()) {
    const result = await compileCSS(path);
    themes[basename(path, ".css")] = result.toString();
  }

  return JSON.stringify(themes);
}

async function minify(artifacts: Bun.BuildArtifact[]) {
  for (const artifact of artifacts) {
    if (artifact.path.endsWith(".js")) {
      const source = await artifact.text();
      const result = await terser.minify(source, {
        ecma: 2020,
        module: true,
        compress: {
          reduce_funcs: false,
          passes: 2,
          // NOTE: Comment out to keep performance markers for debugging.
          pure_funcs: ["performance.mark", "performance.measure"],
        },
        format: {
          semicolons: false,
        },
        mangle: {
          properties: {
            regex: String.raw`^\$\$`,
          },
        },
      });
      await Bun.write(artifact.path, result.code!);
    }
  }
}

console.time("prebuild");
await Bun.$`rm -rf dist`;
await Bun.$`cp -r static dist`;
console.timeEnd("prebuild");

console.time("manifest");
await Bun.write("dist/manifest.json", JSON.stringify(createManifest()));
console.timeEnd("manifest");

console.time("themes");
await Bun.write("dist/newtab.css", await compileCSS("src/newtab.css"));
await Bun.write("dist/settings.css", await compileCSS("src/settings.css"));
await Bun.write("dist/themes.json", await makeThemes("src/themes/*.css"));
console.timeEnd("themes");

console.time("build:apps");
const out1 = await Bun.build({
  entrypoints: ["src/newtab.ts", "src/settings.ts"],
  outdir: "dist",
  naming: "[dir]/[name].[ext]",
  target: "browser",
  minify: !dev,
  sourcemap: dev ? "linked" : "none",
});
console.timeEnd("build:apps");

console.time("build:worker");
const out2 = await Bun.build({
  entrypoints: ["src/sw.ts"],
  outdir: "dist",
  target: "browser",
  minify: !dev,
  sourcemap: dev ? "linked" : "none",
});
console.timeEnd("build:worker");

if (!dev) {
  console.time("minify");
  await minify(out1.outputs);
  await minify(out2.outputs);
  console.timeEnd("minify");
}
