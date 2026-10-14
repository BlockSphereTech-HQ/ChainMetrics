const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")
const { ensureAssets } = require("./ensure-assets")

const root = path.join(__dirname, "..")
const page = "http://localhost:3000/"
ensureAssets()

const children = []
let opened = false

function openBrowser(url) {
  if (opened) return
  opened = true
  const child =
    process.platform === "win32"
      ? spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore", windowsHide: true })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" })
  child.unref()
}

function run(command, args, name, onText) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    windowsHide: true,
  })
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString()
    process.stdout.write(text)
    if (onText) onText(text)
  })
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk)
  })
  child.on("exit", (code, signal) => {
    if (signal) return
    if (code && code !== 0) {
      console.error(name + " exited with code " + code)
      shutdown(code)
    }
  })
  children.push(child)
  return child
}

function shutdown(code) {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js")
if (!fs.existsSync(viteBin)) {
  console.error("Dependencies are missing. Run npm install.")
  process.exit(1)
}

run(process.execPath, [path.join(root, "app", "index.js")], "server")
run(process.execPath, [viteBin], "frontend", (text) => {
  if (text.includes("Local:")) {
    console.log("Chain Metrics is running at " + page)
    openBrowser(page)
  }
})
