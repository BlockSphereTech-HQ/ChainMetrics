const express = require("express")
const cors = require("cors")
const fs = require("fs")
const http = require("http")
const path = require("path")

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(cors())

function mount(routePath, loadRoute) {
  try {
    app.use(routePath, loadRoute())
  } catch (error) {
    console.warn(`Skipped ${routePath}: ${error.message}`)
  }
}

const fController = require('./controllers/frontController');

mount("/setting", () => require("./routes/setting"))
mount("/transactions", () => require("./routes/transactions"))
mount("/tokens", () => require("./routes/token"))
mount("/ai", () => require("./routes/ai"))


app.get("/health", function (req, res) {
  res.json({ ok: true })
})

app.get("/", function (req, res) {
  const page = path.join(__dirname, "../build/index.html")
  if (fs.existsSync(page)) {
    res.sendFile(page)
    return
  }
  res.redirect(302, "http://localhost:3000/")
})

app.use(function (err, req, res, next) {
  if (err && err.type === "entity.parse.failed") {
    res.status(400).json({
      error: "invalid_json",
      message: "Request body must be valid JSON.",
    })
    return
  }
  next(err)
})

const server = http.createServer(app)

server.on("error", function (error) {
  if (error && error.code === "EADDRINUSE") {
    console.log("API already running on port " + port)
    process.exit(0)
  }
  console.error(error && error.message ? error.message : error)
  process.exit(1)
})

server.listen(port, function () {
  console.log("app listening on port: " + port)
})

module.exports = app
