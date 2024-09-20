import * as fs from "fs";
import * as path from "path";

// Directories to ignore
const ignoreDirs = ["node_modules", "dist", "public", "images", ".git"];

// Function to check if a path is a directory
function isDirectory(dirPath: string): boolean {
  return fs.statSync(dirPath).isDirectory();
}

// Function to check if a file is a TypeScript file
function isTypeScriptFile(filePath: string): boolean {
  return path.extname(filePath) === ".ts";
}

// Function to read the directory and file contents
function getCompactDirectoryStructure(dirPath: string): any {
  const result: any = {
    name: path.basename(dirPath),
    type: isDirectory(dirPath) ? "directory" : "file",
  };

  if (isDirectory(dirPath)) {
    result.children = fs
      .readdirSync(dirPath)
      .filter((child) => {
        const childPath = path.join(dirPath, child);
        // Exclude ignored directories and non-TypeScript files
        return (
          !ignoreDirs.some((ignored) => childPath.includes(ignored)) &&
          (isDirectory(childPath) || isTypeScriptFile(childPath))
        );
      })
      .map((child) => getCompactDirectoryStructure(path.join(dirPath, child)));
  } else if (isTypeScriptFile(dirPath)) {
    // Read the content of the TypeScript file and add it to the result
    result.content = fs.readFileSync(dirPath, "utf-8");
  }

  return result;
}

// Entry point to start the capture
const directoryPath = process.argv[2] || ".";
const outputFileName = process.argv[3] || "project_structure_with_content.json";

const projectStructure = getCompactDirectoryStructure(directoryPath);

// Write the JSON structure (with file contents) to a file
fs.writeFileSync(
  outputFileName,
  JSON.stringify(projectStructure, null, 2),
  "utf-8"
);
console.log(`Project structure with file content saved to '${outputFileName}'`);
