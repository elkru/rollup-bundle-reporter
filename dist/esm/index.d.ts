export function bundleReporter(): {
    name: string;
    writeBundle(options: any, bundle: any): Promise<void>;
};
