import { join } from 'path';
import { createReadStream } from 'fs';
import { readdir, stat } from "fs/promises";
import pump from 'pump';
import { pack as tarPack } from 'tar-stream';

const ROOTFS = 'rootfs';
const MANIFEST = 'manifest';

export function createManifest(options = {}) {
  return Object.assign(
    {
      acKind: 'ImageManifest',
      acVersion: '0.8.11'
    },
    options
  );
}

async function writeManifest(pack, manifest) {
  const uname = 'root';
  const gname = 'sys';

  return new Promise((resolve, reject) => {
    pack
      .entry(
        {
          name: MANIFEST,
          type: 'file',
          uname,
          gname
        },
        JSON.stringify(manifest)
      )
      .end(err => {
        if (err) reject(err);
        else resolve();
      });
  });
}

export async function archive(out, dir, manifest) {
  const pack = tarPack();
  const uname = 'root';
  const gname = 'sys';

  await writeManifest(pack, manifest);

  const queue = [];

  await walk(queue, dir, '');

  return new Promise((resolve, reject) => {
    pump(pack, out, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    const append = () => {
      const entry = queue.shift();
      if (entry === undefined) {
        pack.finalize();
        return;
      }

      const name = entry.name;
      entry.name = join(ROOTFS, name);
      pump(createReadStream(join(dir, name)), pack.entry(entry), err => {
        if (err) {
          reject(err);
          return;
        }
        append();
      });
    };

    append();
  });
}

async function walk(queue, base, dir) {
  const entries = await readdir(join(base, dir));

  const stats = await Promise.all(
    entries.map(entry => stat(join(base, dir, entry)))
  );

  for (const i in stats) {
    const stat = stats[i];
    if (stat.isDirectory()) {
      await walk(queue, base, join(dir, entries[i]));
    } else if (stat.isFile()) {
      const header = {
        name: join(dir, entries[i]),
        mtime: stat.mtime,
        size: stat.size,
        type: 'file',
        uid: stat.uid,
        gid: stat.gid
      };

      queue.push(header);
    }
  }
}
