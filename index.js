"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Directories to ignore
var ignoreDirs = ["node_modules", "dist", "public", "images", ".git"];
// Function to check if a path is a directory
function isDirectory(dirPath) {
    return fs.statSync(dirPath).isDirectory();
}
// Function to check if a file is a TypeScript file
function isTypeScriptFile(filePath) {
    return path.extname(filePath) === ".ts";
}
// Function to read the directory and file contents
function getCompactDirectoryStructure(dirPath) {
    var result = {
        name: path.basename(dirPath),
        type: isDirectory(dirPath) ? "directory" : "file",
    };
    if (isDirectory(dirPath)) {
        result.children = fs
            .readdirSync(dirPath)
            .filter(function (child) {
            var childPath = path.join(dirPath, child);
            // Exclude ignored directories and non-TypeScript files
            return (!ignoreDirs.some(function (ignored) { return childPath.includes(ignored); }) &&
                (isDirectory(childPath) || isTypeScriptFile(childPath)));
        })
            .map(function (child) { return getCompactDirectoryStructure(path.join(dirPath, child)); });
    }
    else if (isTypeScriptFile(dirPath)) {
        // Read the content of the TypeScript file and add it to the result
        result.content = fs.readFileSync(dirPath, "utf-8");
    }
    return result;
}
// Entry point to start the capture
var directoryPath = process.argv[2] || ".";
var outputFileName = process.argv[3] || "project_structure_with_content.json";
var projectStructure = getCompactDirectoryStructure(directoryPath);
// Write the JSON structure (with file contents) to a file
fs.writeFileSync(outputFileName, JSON.stringify(projectStructure, null, 2), "utf-8");
console.log("Project structure with file content saved to '".concat(outputFileName, "'"));
