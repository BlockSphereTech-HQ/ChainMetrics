const http = require("http")
const { spawn } = require("child_process")
const path = require("path")

const root = path.join(__dirname, "..")
const page = "http://localhost:3000/"

function probe() {
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

function openBrowser(url) {
  const child =
    process.platform === "win32"
      ? spawn("rundll32", ["url.dll,FileProtocolHandler", url], { detached: true, stdio: "ignore", windowsHide: true })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" })
  child.unref()
}

function runHere() {
  const child = spawn(process.execPath, [path.join(__dirname, "dev.js")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    windowsHide: false,
  })
  child.on("exit", (code) => {
    process.exit(code == null ? 0 : code)
  })
}

async function main() {
  if (process.env.CI || process.env.CM_SKIP_SHOW === "1") return

  if (await probe()) {
    openBrowser(page)
    console.log("Chain Metrics is running at " + page)
    return
  }

  console.log("Dependencies installed. Starting Chain Metrics...")
  runHere()
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error)
  process.exit(0)
})
