"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleReporter = void 0;
var colorette_1 = require("colorette");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var filePath = path_1.default.join(__dirname, 'bundleSize.json');
function fileSizeInKilobytes(path) {
    return __awaiter(this, void 0, void 0, function () {
        var stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, (0, promises_1.stat)(path)];
                case 1:
                    stats = _a.sent();
                    return [2, stats.size / 1000];
            }
        });
    });
}
function storeBundleSize(size) {
    var sizeFile = JSON.stringify({ bundleSize: size });
    fs_1.default.writeFile(filePath, sizeFile, function (error) {
        if (error)
            console.log('failed to store bundle size', error);
    });
}
function getPreviousBundleSize() {
    var _a;
    if (fs_1.default.existsSync(filePath)) {
        var sizeFile = fs_1.default.readFileSync(filePath);
        return (_a = JSON.parse(sizeFile)) === null || _a === void 0 ? void 0 : _a.bundleSize;
    }
    else {
        return null;
    }
}
function getCurrentBundleSize(options, bundle) {
    return __awaiter(this, void 0, void 0, function () {
        var bundleFilePaths, fileSizes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bundleFilePaths = Object.keys(bundle).map(function (key) {
                        var relativeFilePath = bundle[key].fileName;
                        return path_1.default.join(options.dir, relativeFilePath);
                    });
                    return [4, Promise.all(bundleFilePaths.map(function (filePath) { return fileSizeInKilobytes(filePath); }))];
                case 1:
                    fileSizes = _a.sent();
                    return [2, fileSizes.reduce(function (accumulator, size) { return accumulator + size; }, 0)];
            }
        });
    });
}
function getPercentageDifference(oldValue, newValue) {
    if (typeof oldValue === 'number' && typeof newValue === 'number') {
        return Math.round(((newValue - oldValue) / oldValue) * 100);
    }
    else {
        return null;
    }
}
function reportBundleSize(previousBundleSize, currentBundleSize) {
    var difference = getPercentageDifference(previousBundleSize, currentBundleSize);
    if (typeof currentBundleSize === 'number') {
        var currentBundleSizeText = (0, colorette_1.cyan)("".concat(Math.round(currentBundleSize), " kB"));
        console.log("\nBundle size: ".concat(currentBundleSizeText));
    }
    if (typeof difference === 'number') {
        var percentageText = difference > 0 ? (0, colorette_1.red)("".concat(difference, "%")) : (0, colorette_1.green)("".concat(difference, "%"));
        var previousBundleSizeText = (0, colorette_1.cyan)("".concat(Math.round(previousBundleSize), " kB"));
        console.log("This is a ".concat(percentageText, " difference with the previous build of ").concat(previousBundleSizeText));
    }
}
function bundleReporter() {
    return {
        name: 'rollup-bundle-reporter',
        writeBundle: function (options, bundle) {
            return __awaiter(this, void 0, void 0, function () {
                var previousBundleSize, currentBundleSize;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            previousBundleSize = getPreviousBundleSize();
                            return [4, getCurrentBundleSize(options, bundle)];
                        case 1:
                            currentBundleSize = _a.sent();
                            reportBundleSize(previousBundleSize, currentBundleSize);
                            storeBundleSize(currentBundleSize);
                            return [2];
                    }
                });
            });
        },
    };
}
exports.bundleReporter = bundleReporter;
//# sourceMappingURL=index.js.map