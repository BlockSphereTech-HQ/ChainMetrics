import "./StatusTicker.css"
import React, { useEffect, useState } from "react"
import { database } from "../../helpers/firebase"
import { getMarketQuotes } from "../../helpers/marketQuotes"
import { sampleQuote } from "../../helpers/sampleCatalog"

function quoteFor(row, quotes) {
  if (!row || row.presale) return null
  return (quotes && row.symbol && quotes[row.symbol]) || sampleQuote(row.symbol) || null
}

function formatPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "—"
  if (number >= 1000) return "$" + number.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (number >= 1) return "$" + number.toFixed(2)
  if (number >= 0.01) return "$" + number.toFixed(3)
  return "$" + number.toFixed(4)
}

function formatPct(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ""
  const text = Math.abs(number).toFixed(2).replace(/\.00$/, "")
  if (number > 0) return "+" + text + "%"
  if (number < 0) return "−" + text + "%"
  return "0%"
}

export const StatusTicker = () => {
  const [rows, setRows] = useState([])
  const [quotes, setQuotes] = useState({})

  useEffect(() => {
    const ref = database.ref("/coinlist")
    const onValue = (snapshot) => {
      const catalog = snapshot.exists() ? snapshot.val() : {}
      const next = Object.keys(catalog || {})
        .map((id) => ({ id, ...catalog[id] }))
        .filter((row) => row && row.symbol)
      setRows(next)
    }
    ref.on("value", onValue)
    return () => ref.off("value", onValue)
  }, [])

  useEffect(() => {
    if (!(process.env.REACT_APP_FIREBASE_DATABASE_URL || "").trim()) return undefined
    const symbols = rows.filter((row) => row.symbol && !row.presale).map((row) => row.symbol)
    if (!symbols.length) return undefined
    let cancelled = false
    getMarketQuotes(symbols)
      .then((result) => {
        if (!cancelled && result) setQuotes(result)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [rows])

  const items = rows
    .map((row) => {
      const quote = quoteFor(row, quotes)
      const change = quote ? Number(quote.percent_change_24h) : null
      return {
        id: row.id,
        symbol: row.symbol,
        logo: row.logo,
        presale: Boolean(row.presale),
        price: quote ? quote.price : null,
        change: Number.isFinite(change) ? change : null,
        cap: quote ? Number(quote.market_cap) || 0 : 0,
      }
    })
    .sort((a, b) => b.cap - a.cap || String(a.symbol).localeCompare(String(b.symbol)))

  if (!items.length) return null

  return (
    <div className="statusTicker" aria-label="Catalog status">
      <div className="statusTickerTrack">
        {items.map((item) => {
          const tone = item.change == null ? "flat" : item.change < 0 ? "down" : "up"
          return (
            <span className="statusTick" key={item.id}>
              {item.logo ? <img src={item.logo} alt="" /> : null}
              <b>{item.symbol}</b>
              <span>{item.presale ? "Presale" : formatPrice(item.price)}</span>
              {item.presale ? null : <i className={tone}>{formatPct(item.change)}</i>}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default StatusTicker
