import { ENVS } from "./configurations"
import { sampleQuote } from "./sampleCatalog"

const CMC_URL =
  "https://agile-cove-74302.herokuapp.com/https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"

const SUCCESS_TTL_MS = 60 * 1000
const FAILURE_TTL_MS = 10 * 1000
const BATCH_SIZE = 25
const REQUEST_TIMEOUT_MS = 1200
const liveQuotes = Boolean((process.env.REACT_APP_FIREBASE_DATABASE_URL || "").trim())

const cache = new Map()
const inflight = new Map()

function readCache(symbol) {
  const hit = cache.get(symbol)
  if (!hit) return { hit: false }
  if (hit.expires < Date.now()) {
    cache.delete(symbol)
    return { hit: false }
  }
  return { hit: true, quote: hit.quote }
}

function remember(symbol, quote) {
  cache.set(symbol, {
    expires: Date.now() + (quote ? SUCCESS_TTL_MS : FAILURE_TTL_MS),
    quote,
  })
}

function toQuote(entry) {
  if (!entry?.quote?.USD) return null
  return {
    market_cap: entry.quote.USD.market_cap,
    percent_change_24h: entry.quote.USD.percent_change_24h,
    price: entry.quote.USD.price,
    circulating_supply: entry.circulating_supply,
  }
}

function sampleQuotes(symbols) {
  const quotes = {}
  symbols.forEach((symbol) => {
    quotes[symbol] = sampleQuote(symbol) || null
  })
  return quotes
}

async function requestSymbols(symbols, signal) {
  const qs = `?symbol=${symbols.map((symbol) => encodeURIComponent(symbol)).join(",")}&convert=USD`
  const res = await fetch(CMC_URL + qs, {
    headers: { "X-CMC_PRO_API_KEY": ENVS.CMC_KEY },
    signal,
  })
  if (!res.ok) throw new Error(`quotes ${res.status}`)
  const body = await res.json()
  const data = body?.data || {}
  const quotes = {}
  symbols.forEach((symbol) => {
    quotes[symbol] = toQuote(data[symbol]) || sampleQuote(symbol) || null
  })
  return quotes
}

async function fetchBatch(symbols) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null
  const timer = setTimeout(() => {
    if (controller) controller.abort()
  }, REQUEST_TIMEOUT_MS)
  try {
    const chunks = []
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      chunks.push(symbols.slice(i, i + BATCH_SIZE))
    }
    const parts = await Promise.all(chunks.map((chunk) => requestSymbols(chunk, controller ? controller.signal : undefined)))
    return Object.assign({}, ...parts)
  } catch (error) {
    return sampleQuotes(symbols)
  } finally {
    clearTimeout(timer)
  }
}

export async function getMarketQuotes(symbols) {
  const unique = [...new Set((symbols || []).filter((symbol) => symbol != null && symbol !== ""))]
  if (!liveQuotes) return sampleQuotes(unique)
  const result = {}
  const missing = []

  unique.forEach((symbol) => {
    const cached = readCache(symbol)
    if (cached.hit) result[symbol] = cached.quote
    else missing.push(symbol)
  })

  if (missing.length === 0) return result

  const toFetch = []
  const waits = []

  missing.forEach((symbol) => {
    const pending = inflight.get(symbol)
    if (pending) {
      waits.push(
        pending.then((quote) => {
          result[symbol] = quote
        })
      )
    } else {
      toFetch.push(symbol)
    }
  })

  if (toFetch.length) {
    const job = fetchBatch(toFetch).then((quotes) => {
      toFetch.forEach((symbol) => {
        const quote = quotes[symbol] ?? null
        remember(symbol, quote)
        result[symbol] = quote
      })
      return quotes
    })

    toFetch.forEach((symbol) => {
      const pending = job
        .then((quotes) => quotes[symbol] ?? null)
        .catch(() => null)
        .finally(() => inflight.delete(symbol))
      inflight.set(symbol, pending)
    })

    await job
  }

  await Promise.all(waits)
  unique.forEach((symbol) => {
    if (!result[symbol]) {
      const sample = sampleQuote(symbol)
      if (sample) {
        result[symbol] = sample
        remember(symbol, sample)
      }
    }
  })
  return result
}
