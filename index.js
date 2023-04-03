import { green, cyan, red } from 'colorette';
import fs from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'bundleSize.json');

async function fileSizeInKilobytes(path) {
  const stats = await stat(path);
  return stats.size / 1000;
}

function storeBundleSize(size) {
  const sizeFile = JSON.stringify({ bundleSize: size });
  fs.writeFile(filePath, sizeFile, function (error) {
    if (error) console.log('failed to store bundle size', error);
  });
}

function getPreviousBundleSize() {
  if (fs.existsSync(filePath)) {
    const sizeFile = fs.readFileSync(filePath);
    return JSON.parse(sizeFile)?.bundleSize;
  } else {
    return null;
  }
}

async function getCurrentBundleSize(options, bundle) {
  const bundleFilePaths = Object.keys(bundle).map(key => {
    const relativeFilePath = bundle[key].fileName;
    return path.join(options.dir, relativeFilePath);
  });
  const fileSizes = await Promise.all(bundleFilePaths.map(filePath => fileSizeInKilobytes(filePath)));
  return fileSizes.reduce((accumulator, size) => accumulator + size, 0);
}

function getPercentageDifference(oldValue, newValue) {
  if (typeof oldValue === 'number' && typeof newValue === 'number') {
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  } else {
    return null;
  }
}

function reportBundleSize(previousBundleSize, currentBundleSize) {
  const difference = getPercentageDifference(previousBundleSize, currentBundleSize);
  if (typeof currentBundleSize === 'number') {
    const currentBundleSizeText = cyan(`${Math.round(currentBundleSize)} kB`);
    console.log(`\nBundle size: ${currentBundleSizeText}`);
  }
  if (typeof difference === 'number') {
    const percentageText = difference > 0 ? red(`${difference}%`) : green(`${difference}%`);
    const previousBundleSizeText = cyan(`${Math.round(previousBundleSize)} kB`);
    console.log(`This is a ${percentageText} difference with the previous build of ${previousBundleSizeText}`);
  }
}

export function bundleReporter() {
  return {
    name: 'rollup-bundle-reporter',
    async writeBundle(options, bundle) {
      const previousBundleSize = getPreviousBundleSize();
      const currentBundleSize = await getCurrentBundleSize(options, bundle);
      reportBundleSize(previousBundleSize, currentBundleSize);
      storeBundleSize(currentBundleSize);
    },
  };
}
