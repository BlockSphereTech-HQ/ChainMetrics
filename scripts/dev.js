const { spawn } = require("child_process")
const fs = require("fs")
const http = require("http")
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
      ? spawn("rundll32", ["url.dll,FileProtocolHandler", url], { detached: true, stdio: "ignore", windowsHide: true })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" })
  child.unref()
}

function siteIsLive() {
  return new Promise((resolve) => {
    const req = http.get(page, (res) => {
      res.resume()
      resolve(Boolean(res.statusCode && res.statusCode < 500))
    })
    req.setTimeout(800, () => {
      req.destroy()
      resolve(false)
    })
    req.on("error", () => resolve(false))
  })
}

function openWhenLive() {
  const started = Date.now()
  const tick = async () => {
    if (opened) return
    if (await siteIsLive()) {
      console.log("Chain Metrics is running at " + page)
      openBrowser(page)
      return
    }
    if (Date.now() - started > 60000) {
      console.error("Chain Metrics did not become ready.")
      return
    }
    setTimeout(tick, 250)
  }
  tick()
}

function run(command, args, name, onText) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    windowsHide: true,
  })
  const forward = (chunk, stream) => {
    const text = chunk.toString()
    stream.write(text)
    if (onText) onText(text)
  }
  child.stdout.on("data", (chunk) => forward(chunk, process.stdout))
  child.stderr.on("data", (chunk) => forward(chunk, process.stderr))
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
run(process.execPath, [viteBin], "frontend")
openWhenLive()
