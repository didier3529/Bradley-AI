#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🧹 Cleaning and restarting development server...");

// Run clean command first
const cleanProcess = spawn("npm", ["run", "clean"], {
  stdio: "inherit",
  shell: true,
  cwd: path.resolve(__dirname, "../.."),
});

cleanProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Clean completed, starting development server...");

    // Then start dev server
    const devProcess = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: path.resolve(__dirname, "../.."),
    });

    devProcess.on("close", (devCode) => {
      console.log(`Development server exited with code ${devCode}`);
    });
  } else {
    console.error(`❌ Clean failed with code ${code}`);
    process.exit(1);
  }
});
