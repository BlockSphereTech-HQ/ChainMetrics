import "./Home.css"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { WalletLink } from "../../components/WalletLink/WalletLink"
import { AppContext } from "../../context"
import { database } from "../../helpers/firebase"
import { getMarketQuotes } from "../../helpers/marketQuotes"
import { sampleQuote } from "../../helpers/sampleCatalog"
import { InsightChange } from "../../components/InsightChart/InsightChart"
import { VoteHoldings } from "../../components/VoteHoldings/VoteHoldings"

const AREAS = [
  {
    to: "/listings",
    title: "Listings",
    text: "Name, chain, market cap, tier, and stored votes for each public token.",
  },
  {
    to: "/discover",
    title: "Discovery",
    text: "Ask a question. The catalog returns matching listings. It does not write the list.",
  },
  {
    to: "/intelligence",
    title: "Intelligence",
    text: "Counts, tier mix, and market quotes calculated from the records already stored.",
  },
  {
    to: "/treasury",
    title: "Treasury",
    text: "The treasury balance and the weekly vote ranking.",
  },
  {
    to: "/promote",
    title: "Promote",
    text: "Day-priced banners for a token already listed. Votes and tier stay a community record.",
  },
  {
    to: "/listcoin",
    title: "List a token",
    text: "Submit a public listing, then choose Emerald, Ruby, or Diamond.",
  },
]

function tierLabel(votes) {
  const count = Number(votes) || 0
  if (count >= 500) return "Diamond"
  if (count >= 250) return "Ruby"
  return "Emerald"
}

function quoteFor(row, quotes) {
  if (!row || row.presale) return null
  const quote = (quotes && row.symbol && quotes[row.symbol]) || sampleQuote(row.symbol)
  return quote || null
}

function changeFor(row, quotes) {
  const quote = quoteFor(row, quotes)
  const value = quote && Number(quote.percent_change_24h)
  return Number.isFinite(value) ? value : null
}

function formatUsd(value, digits) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "—"
  const abs = Math.abs(number)
  const fixed = (amount, places) => amount.toFixed(places).replace(/\.0$/, "")
  if (abs >= 1e9) return "$" + fixed(number / 1e9, 2) + "B"
  if (abs >= 1e6) return "$" + fixed(number / 1e6, abs >= 1e8 ? 0 : 1) + "M"
  if (abs >= 1e3) return "$" + fixed(number / 1e3, 1) + "K"
  if (abs >= 1) return "$" + number.toFixed(digits == null ? 2 : digits)
  if (abs >= 0.01) return "$" + number.toFixed(3)
  return "$" + number.toFixed(4)
}

function formatPct(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "—"
  const text = Math.abs(number).toFixed(1).replace(/\.0$/, "")
  if (number > 0) return "+" + text + "%"
  if (number < 0) return "−" + text + "%"
  return "0%"
}

function tone(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number === 0) return "flat"
  return number > 0 ? "up" : "down"
}

export const Home = () => {
  const { walletAddress, requestWallet } = useContext(AppContext)
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [quotes, setQuotes] = useState({})

  useEffect(() => {
    const ref = database.ref("/coinlist")
    const onValue = (snapshot) => {
      const catalog = snapshot.exists() ? snapshot.val() : {}
      const next = Object.keys(catalog || {})
        .map((id) => ({ id, ...catalog[id] }))
        .filter((row) => row && row.name)
        .sort((a, b) => Number(b.voteCount || 0) - Number(a.voteCount || 0))
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

  const openToken = async (event, id) => {
    if (walletAddress) {
      navigate("/details/" + encodeURIComponent(id))
      return
    }
    const address = await requestWallet("connect")
    if (address) navigate("/details/" + encodeURIComponent(id))
  }

  const votes = rows.reduce((sum, row) => sum + (Number(row.voteCount) || 0), 0)
  const quoted = rows
    .map((row) => ({ row, quote: quoteFor(row, quotes), change: changeFor(row, quotes) }))
    .filter((item) => item.quote)
  const marketCap = quoted.reduce((sum, item) => sum + (Number(item.quote.market_cap) || 0), 0)
  const rising = quoted.filter((item) => item.change > 0).length
  const falling = quoted.filter((item) => item.change < 0).length
  const ranked = rows
    .slice()
    .sort((a, b) => {
      const left = changeFor(a, quotes)
      const right = changeFor(b, quotes)
      if (left == null && right == null) return String(a.symbol || "").localeCompare(String(b.symbol || ""))
      if (left == null) return 1
      if (right == null) return -1
      return right - left
    })

  return (
    <div className="homePage">
      <header className="homeHead">
        <div className="homeHeadTop">
          <h1 id="home-title">Beyond market data, into blockchain intelligence.</h1>
          <div className="homeActions">
            <WalletLink className="homePrimary" to="/listings">View listings</WalletLink>
            <WalletLink className="homeSecondary" to="/discover">Search the catalog</WalletLink>
          </div>
        </div>
        <p>
          Chain Metrics is a public catalog for people comparing token listings and for projects that list. Each record holds the market quote, community votes, and a report, and AI search answers a plain-language question from those rows. Votes from a connected wallet move the listing through Emerald, Ruby, and Diamond. A listed project can buy a day-priced placement, kept separate from the vote count.
        </p>
      </header>

      <section className="homeMetrics" aria-label="Catalog summary">
        <article>
          <span>Listed assets</span>
          <strong>{rows.length ? rows.length.toLocaleString() : "—"}</strong>
          <em>{rows.filter((row) => row.presale).length} presale</em>
        </article>
        <article>
          <span>Community votes</span>
          <strong>{rows.length ? votes.toLocaleString() : "—"}</strong>
          <em>Stored on the catalog</em>
        </article>
        <article>
          <span>Quoted market cap</span>
          <strong>{quoted.length ? formatUsd(marketCap) : "—"}</strong>
          <em>{quoted.length} assets with a quote</em>
        </article>
        <article>
          <span>24h breadth</span>
          <strong className={rising >= falling ? "up" : "down"}>{quoted.length ? rising + " / " + falling : "—"}</strong>
          <em>Advancing / declining</em>
        </article>
      </section>

      <section className="homeBlock" aria-labelledby="home-quotes-title">
        <div className="homeBlockHead">
          <h2 id="home-quotes-title">Quoted assets</h2>
          <WalletLink to="/listings">Full table</WalletLink>
        </div>
        {rows.length ? (
          <div className="homeQuotes">
            {ranked.map((row) => {
              const quote = quoteFor(row, quotes)
              const change = changeFor(row, quotes)
              return (
                <WalletLink
                  key={row.id}
                  to={"/details/" + encodeURIComponent(row.id)}
                >
                  <span className="homeQuoteTop">
                    <img src={row.logo} alt="" />
                    <b>{row.symbol || row.name}</b>
                    <i className={tone(change)}>{row.presale ? "Presale" : formatPct(change)}</i>
                  </span>
                  <span className="homeQuoteName">{row.name}</span>
                  <strong>{quote ? formatUsd(quote.price) : "—"}</strong>
                  <em>{quote ? formatUsd(quote.market_cap) + " mkt cap" : row.network}</em>
                </WalletLink>
              )
            })}
          </div>
        ) : (
          <p className="homeEmpty">The catalog is loading.</p>
        )}
      </section>

      <section className="homeBlock" aria-labelledby="home-insight-title">
        <div className="homeBlockHead">
          <h2 id="home-insight-title">24h change</h2>
          <span>A bar above the line is up. A bar below the line is down.</span>
        </div>
        <div className="homeChart">
          {rows.length ? (
            <InsightChange
              label="24-hour change by token"
              items={ranked.map((row) => {
                const value = changeFor(row, quotes)
                return {
                  id: row.id,
                  label: row.symbol || row.name,
                  value,
                  color: value == null ? "#3a4150" : value < 0 ? "#f6465d" : "#16c784",
                }
              })}
            />
          ) : (
            <p className="homeEmpty">The catalog is loading.</p>
          )}
        </div>
      </section>

      <section className="homeBlock" aria-labelledby="home-hold-title">
        <div className="homeBlockHead">
          <h2 id="home-hold-title">Votes by tier</h2>
          <span>A listing starts at Emerald. Ruby begins at 250 votes. Diamond begins at 500.</span>
        </div>
        <VoteHoldings rows={rows} />
      </section>

      <section className="homeBlock" aria-labelledby="home-rank-title">
        <div className="homeBlockHead">
          <h2 id="home-rank-title">Vote rank</h2>
          <WalletLink to="/listings">Open listings</WalletLink>
        </div>
        <div className="homeTableWrap">
          <table className="homeTable">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Chain</th>
                <th>Price</th>
                <th>24h</th>
                <th>Votes</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((row) => {
                const quote = quoteFor(row, quotes)
                const change = changeFor(row, quotes)
                return (
                  <tr key={row.id} onClick={(event) => openToken(event, row.id)}>
                    <td>
                      <span className="homeAsset">
                        <img src={row.logo} alt="" />
                        <b>{row.name}</b>
                        <i>{row.symbol}</i>
                      </span>
                    </td>
                    <td>{row.network || "—"}</td>
                    <td>{quote ? formatUsd(quote.price) : "—"}</td>
                    <td className={tone(change)}>{row.presale ? "—" : formatPct(change)}</td>
                    <td>{Number(row.voteCount || 0).toLocaleString()}</td>
                    <td>{tierLabel(row.voteCount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="homeBlock" aria-labelledby="home-areas-title">
        <div className="homeBlockHead">
          <h2 id="home-areas-title">Sections</h2>
        </div>
        <div className="homeGrid">
          {AREAS.map((area) => (
            <WalletLink className="homeCard" key={area.to} to={area.to}>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </WalletLink>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
