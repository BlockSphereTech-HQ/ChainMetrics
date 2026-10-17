import { createSampleStore } from "./sampleCatalog"

const databaseURL = (process.env.REACT_APP_FIREBASE_DATABASE_URL || "").replace(/\/$/, "")

let sampleMode = !databaseURL
let memory = createSampleStore()
const sampleListeners = new Set()

export function isSampleCatalog() {
  return sampleMode
}

function notifySample() {
  sampleListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.warn("sample catalog listener error:", error)
    }
  })
}

function enableSample() {
  sampleMode = true
}

function toSnapshot(data) {
  const value = data == null ? null : JSON.parse(JSON.stringify(data))
  return {
    exists() {
      return value !== null && value !== undefined
    },
    val() {
      return value
    },
  }
}

function normalizePath(path) {
  return String(path || "").replace(/^\/+|\/+$/g, "")
}

function applyQuery(data, query) {
  const rows = data && typeof data === "object" ? data : {}
  let ids = Object.keys(rows)
  if (query.orderBy) {
    let key = query.orderBy
    try {
      key = JSON.parse(query.orderBy)
    } catch (error) {
      key = query.orderBy
    }
    ids = ids.filter((id) => {
      const value = rows[id] && rows[id][key]
      if (query.equalTo != null) return String(value) === String(query.equalTo)
      if (query.startAt != null) return Number(value) >= Number(query.startAt)
      return true
    })
  }
  if (!ids.length) return null
  const out = {}
  ids.forEach((id) => {
    out[id] = rows[id]
  })
  return out
}

function readSample(path, query) {
  const clean = normalizePath(path)
  if (clean === "coinlist") return applyQuery(memory.coinlist, query)
  if (clean === "votelimit") return applyQuery(memory.votelimit, query)
  if (clean.startsWith("coinlist/")) {
    const row = memory.coinlist[clean.slice("coinlist/".length)]
    return row == null ? null : row
  }
  if (clean.startsWith("votelimit/")) {
    const row = memory.votelimit[clean.slice("votelimit/".length)]
    return row == null ? null : row
  }
  return null
}

function writeSample(path, values, replace) {
  const clean = normalizePath(path)
  const apply = (bucket, id) => {
    if (!bucket[id] || replace) bucket[id] = {}
    Object.assign(bucket[id], values || {})
  }
  if (clean.startsWith("coinlist/")) apply(memory.coinlist, clean.slice("coinlist/".length))
  else if (clean.startsWith("votelimit/")) apply(memory.votelimit, clean.slice("votelimit/".length))
  else return false
  notifySample()
  return true
}

function buildUrl(path, query) {
  const clean = normalizePath(path)
  const params = new URLSearchParams()
  if (query.orderBy != null) params.set("orderBy", query.orderBy)
  if (query.startAt != null) params.set("startAt", String(query.startAt))
  if (query.endAt != null) params.set("endAt", String(query.endAt))
  if (query.equalTo != null) params.set("equalTo", String(query.equalTo))
  if (query.limitToFirst != null) params.set("limitToFirst", String(query.limitToFirst))
  if (query.limitToLast != null) params.set("limitToLast", String(query.limitToLast))
  const qs = params.toString()
  return `${databaseURL}/${clean}.json${qs ? `?${qs}` : ""}`
}

function emptyCatalog(path, data) {
  return normalizePath(path) === "coinlist" && (data == null || (typeof data === "object" && !Object.keys(data).length))
}

class DbRef {
  constructor(path, query = {}) {
    this.path = path
    this.query = query
    this._timers = new Map()
  }

  orderByChild(key) {
    return new DbRef(this.path, { ...this.query, orderBy: JSON.stringify(String(key)) })
  }

  startAt(value) {
    return new DbRef(this.path, { ...this.query, startAt: value })
  }

  endAt(value) {
    return new DbRef(this.path, { ...this.query, endAt: value })
  }

  equalTo(value) {
    return new DbRef(this.path, { ...this.query, equalTo: value })
  }

  async get() {
    if (sampleMode) return toSnapshot(readSample(this.path, this.query))
    if (!databaseURL) {
      enableSample()
      return toSnapshot(readSample(this.path, this.query))
    }
    try {
      const response = await fetch(buildUrl(this.path, this.query))
      if (!response.ok) throw new Error(`database get failed: ${response.status}`)
      const data = await response.json()
      if (emptyCatalog(this.path, data)) {
        enableSample()
        return toSnapshot(readSample(this.path, this.query))
      }
      return toSnapshot(data)
    } catch (error) {
      if (normalizePath(this.path) === "coinlist") {
        enableSample()
        return toSnapshot(readSample(this.path, this.query))
      }
      throw error
    }
  }

  once() {
    return this.get()
  }

  on(event, callback, onError) {
    if (event !== "value" || typeof callback !== "function") return callback
    const poll = async () => {
      try {
        callback(await this.get())
      } catch (error) {
        console.warn("database listen error:", error)
        if (typeof onError === "function") onError(error)
        else callback(toSnapshot(null))
      }
    }
    poll()
    const listener = () => {
      poll()
    }
    sampleListeners.add(listener)
    const timer = sampleMode ? 0 : window.setInterval(poll, 20000)
    this._timers.set(callback, { timer, listener })
    return callback
  }

  off(event, callback) {
    const record = this._timers.get(callback)
    if (!record) return
    if (record.timer) window.clearInterval(record.timer)
    sampleListeners.delete(record.listener)
    this._timers.delete(callback)
  }

  update(values) {
    if (sampleMode || !databaseURL) {
      enableSample()
      writeSample(this.path, values, false)
      return Promise.resolve(values)
    }
    return fetch(buildUrl(this.path, {}), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values || {}),
    }).then((response) => {
      if (!response.ok) throw new Error(`database update failed: ${response.status}`)
      return response.json()
    })
  }

  set(values) {
    if (sampleMode || !databaseURL) {
      enableSample()
      writeSample(this.path, values, true)
      return Promise.resolve(values)
    }
    return fetch(buildUrl(this.path, {}), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((response) => {
      if (!response.ok) throw new Error(`database set failed: ${response.status}`)
      return response.json()
    })
  }

  push(values) {
    if (sampleMode || !databaseURL) {
      enableSample()
      const clean = normalizePath(this.path)
      const bucket = clean === "votelimit" ? memory.votelimit : memory.coinlist
      const id = "sample-" + Math.random().toString(36).slice(2, 10)
      const record = { ...(values || {}) }
      if (clean !== "votelimit" && record.promoted == null) record.promoted = 1
      bucket[id] = record
      notifySample()
      return Promise.resolve({ name: id })
    }
    return fetch(buildUrl(this.path, {}), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values || {}),
    }).then((response) => {
      if (!response.ok) throw new Error(`database push failed: ${response.status}`)
      return response.json()
    })
  }
}

export const database = {
  ref(path) {
    return new DbRef(path)
  },
}

export default { database }
