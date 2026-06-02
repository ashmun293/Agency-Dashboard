import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const tscBin = path.join(rootDir, "node_modules", "typescript", "bin", "tsc");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const appUrl = "http://127.0.0.1:5173";
const apiHealthUrl = "http://127.0.0.1:4174/api/health";
const children = [];
let shuttingDown = false;

console.log("Starting AI Lead Dashboard...");
await runBuild();

const apiAlreadyRunning = await canFetch(apiHealthUrl);
if (apiAlreadyRunning) {
  console.log("API already running on http://127.0.0.1:4174");
} else {
  children.push(startProcess("API", process.execPath, [path.join(rootDir, ".agents-dist", "agents", "server", "apiServer.js")]));
}

const appAlreadyRunning = await canFetch(appUrl);
if (appAlreadyRunning) {
  console.log("Dashboard already running on " + appUrl);
} else {
  children.push(startProcess("Vite", process.execPath, [viteBin, "--host", "127.0.0.1"]));
}

await waitFor(apiHealthUrl, "API");
await waitFor(appUrl, "Dashboard");
openBrowser(appUrl);

console.log("");
console.log("Dashboard ready: " + appUrl);
console.log("Leave this window open while you use the dashboard. Press Ctrl+C here to stop launched services.");

if (!children.length) {
  console.log("Both services were already running, so this launcher can be closed.");
} else {
  await new Promise(() => {});
}

async function runBuild() {
  console.log("Building agent backend...");
  await new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [tscBin, "-p", "tsconfig.agents.json", "--pretty", "false"], {
      cwd: rootDir,
      stdio: "inherit"
    });
    build.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("Agent backend build failed with exit code " + code));
    });
    build.on("error", reject);
  });
}

function startProcess(label, command, args) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit"
  });
  child.on("exit", (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.warn(label + " exited with code " + code + ".");
    }
  });
  child.on("error", (error) => {
    if (!shuttingDown) console.error(label + " failed to start: " + error.message);
  });
  return child;
}

async function waitFor(url, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    if (await canFetch(url)) return;
    await delay(500);
  }
  throw new Error(label + " did not become ready at " + url);
}

async function canFetch(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function openBrowser(url) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  if (process.platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

function stopChild(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) stopChild(child);
  setTimeout(() => process.exit(0), 250);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
