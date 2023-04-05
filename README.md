# Rollup Bundle Reporter

A plugin to get metrics from your rollup build.

<img width="285" alt="image" src="https://user-images.githubusercontent.com/69413287/230008164-ea52b9c4-a242-4905-b590-db8ab9fd68a0.png">

## Installation

```sh
npm install --save-dev rollup-bundle-reporter
```

## Usage

Import

```javascript
import { bundleReporter } from 'rollup-bundle-reporter';
```

vite.config.ts (TypeScript)

```typescript
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [bundleReporter()],
});
```
