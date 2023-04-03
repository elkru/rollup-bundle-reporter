# Rollup Bundle Reporter

A plugin to get metrics from your rollup build.

## Installation

```sh
npm install --save-dev rollup-bundle-reporter
```

## Usage

Import CommonJS

```javascript
import { bundleReporter } from 'rollup-bundle-reporter';
```

Import ECMAScript

```javascript
const { bundleReporter } = require('rollup-bundle-reporter');
```

vite.config.ts (TypeScript)

```typescript
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [bundleReporter()],
});
```
