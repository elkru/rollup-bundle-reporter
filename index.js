import { green } from 'colorette';
import path from 'path';
import { stat } from 'fs/promises';

async function fileSizeInKilobytes(path) {
  const stats = await stat(path);
  return stats.size / 1000;
}

export default function () {
  return {
    name: 'rollup-bundle-reporter',
    async writeBundle(options, bundle) {
      const bundleFilePaths = Object.keys(bundle).map(key => {
        const relativeFilePath = bundle[key].fileName;
        return path.join(options.dir, relativeFilePath);
      });
      const fileSizes = await Promise.all(bundleFilePaths.map(filePath => fileSizeInKilobytes(filePath)));
      const bundleSize = fileSizes.reduce((accumulator, size) => accumulator + size, 0);
      console.log(`Bundle size: ${green(Math.round(bundleSize))} kB`);
    },
  };
}
