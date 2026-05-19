const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src', 'public');
const destDir = path.resolve(__dirname, '..', 'public');

async function exists(p) {
  try {
    await fs.promises.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.promises.stat(src);
  if (stat.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await fs.promises.copyFile(src, dest);
  }
}

async function sync() {
  if (!(await exists(srcDir))) {
    console.log('src/public does not exist — nothing to sync');
    return;
  }

  // remove dest if exists
  if (await exists(destDir)) {
    await fs.promises.rm(destDir, { recursive: true, force: true });
  }

  await copyRecursive(srcDir, destDir);
  console.log('Synced src/public -> public');
}

sync().catch((err) => {
  console.error('Failed to sync public folders:', err);
  process.exit(1);
});
