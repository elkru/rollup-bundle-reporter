import { green, cyan, red } from 'colorette';
import fs from 'fs';
import { stat } from 'fs/promises';
import { gzipSizeFromFile } from 'gzip-size';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'bundleSize.json');

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fileSizeInKilobytes(size) {
  return size / 1000;
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
  const fileSizes = await Promise.all(
    bundleFilePaths.map(async filePath => {
      if (filePath.includes('html')) return 0;
      const stats = await stat(filePath);
      return fileSizeInKilobytes(stats.size);
    })
  );
  const gzipFileSizes = await Promise.all(
    bundleFilePaths.map(async filePath => {
      if (filePath.includes('html')) return 0;
      const gzipSize = await gzipSizeFromFile(filePath);
      return fileSizeInKilobytes(gzipSize);
    })
  );
  const bundleSize = fileSizes.reduce((accumulator, size) => accumulator + size, 0);
  const bundleSizeGzip = gzipFileSizes.reduce((accumulator, size) => accumulator + size, 0);
  return { bundleSize, bundleSizeGzip };
}

function getPercentageDifference(oldValue, newValue) {
  if (typeof oldValue === 'number' && typeof newValue === 'number') {
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  } else {
    return null;
  }
}

function reportBundleSize(previousBundleSize, { bundleSize, bundleSizeGzip }) {
  const difference = getPercentageDifference(previousBundleSize, bundleSize);
  console.log(difference, previousBundleSize, bundleSize);
  if (typeof bundleSize === 'number') {
    const currentBundleSizeText = `${cyan(formatter.format(bundleSize))} kB | gzip: ${cyan(
      formatter.format(bundleSizeGzip)
    )} kB`;
    console.log(`\nBundle size: ${currentBundleSizeText}`);
  }
  if (typeof difference === 'number' && difference !== 0) {
    const percentageText = difference > 0 ? red(`${Math.abs(difference)}%`) : green(`${Math.abs(difference)}%`);
    const previousBundleSizeText = cyan(`${formatter.format(previousBundleSize)} kB`);
    console.log(`Previous build: ${previousBundleSizeText}`);
    console.log(`Size ${difference > 0 ? 'increase' : 'decrease'}: ${percentageText}`);
  }
}

export function bundleReporter() {
  return {
    name: 'rollup-bundle-reporter',
    async writeBundle(options, bundle) {
      const previousBundleSize = getPreviousBundleSize();
      const currentBundleSize = await getCurrentBundleSize(options, bundle);
      reportBundleSize(previousBundleSize, currentBundleSize);
      storeBundleSize(currentBundleSize.bundleSize);
    },
  };
}
