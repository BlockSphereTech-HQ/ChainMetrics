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
      ? spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore", windowsHide: true })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" })
  child.unref()
}

function waitReady(limitMs) {
  const start = Date.now()
  return new Promise((resolve) => {
    const tick = async () => {
      if (await probe()) {
        resolve(true)
        return
      }
      if (Date.now() - start > limitMs) {
        resolve(false)
        return
      }
      setTimeout(tick, 200)
    }
    tick()
  })
}

async function main() {
  if (process.env.CI) return
  if (await probe()) {
    openBrowser("http://localhost:3000/")
    console.log("Chain Metrics is running at http://localhost:3000/")
    return
  }

  const child = spawn(process.execPath, [path.join(__dirname, "dev.js")], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: process.env,
  })
  child.unref()

  const ready = await waitReady(12000)
  if (ready) {
    console.log("Chain Metrics is running at http://localhost:3000/")
    return
  }
  console.error("Chain Metrics did not become ready. Run npm start.")
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error)
  process.exit(0)
})
