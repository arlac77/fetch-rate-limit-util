import test from "ava";

import { archive, createManifest } from "bocf";
import { createWriteStream } from "fs";
import { stat } from "fs/promises";

test("archive", async t => {
  const outFileName = new URL("../test.aci", import.meta.url).pathname;
  const out = createWriteStream(outFileName);

  await archive(
    out,
    new URL(".", import.meta.url).pathname,
    createManifest({
      labels: [
        {
          name: "version",
          value: "1.0.0"
        },
        {
          name: "arch",
          value: "amd64"
        },
        {
          name: "os",
          value: "linux"
        }
      ],
      app: {
        exec: ["/usr/bin/reduce-worker", "--quiet"],
        user: "100",
        group: "300"
      },
      supplementaryGids: [400, 500],
      eventHandlers: [
        {
          exec: ["/usr/bin/data-downloader"],
          name: "pre-start"
        },
        {
          exec: ["/usr/bin/deregister-worker", "--verbose"],
          name: "post-stop"
        }
      ],
      workingDirectory: "/opt/work",
      environment: [
        {
          name: "REDUCE_WORKER_DEBUG",
          value: "true"
        }
      ]
    })
  );

  const s = await stat(outFileName);

  t.is(s.size, 5120);
});
