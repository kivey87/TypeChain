"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function getFilename(path) {
    return path_1.parse(path).name;
}
exports.getFilename = getFilename;
