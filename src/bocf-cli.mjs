import { expand } from "config-expander";
import { archive, createManifest } from "./archive.mjs";
import { basename } from "path";
import { createWriteStream, readFileSync } from "fs";
import program from "commander";

const { version, description } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url).pathname, {
    encoding: "utf8"
  })
);

program
  .usage(description)
  .version(version)
  .option("-c, --config <file>", "use config from file")
  .action(async () => {
    const options = program.opts();
    const out = createWriteStream("/tmp/a.tar");
    const config = await expand(
      options.config ? "${include('" + basename(options.config) + "')}" : {}
    );

    archive(out, ".", createManifest({ name: "example.com/reduce-worker" }));
  })
  .parse(process.argv);
