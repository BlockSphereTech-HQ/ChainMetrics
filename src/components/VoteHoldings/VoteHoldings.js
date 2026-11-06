import "./VoteHoldings.css"
import React from "react"
import { WalletLink } from "../WalletLink/WalletLink"
import { tokenAccent } from "../../helpers/insightSeries"

const TIERS = [
  { name: "Emerald", mark: "E", color: "#3ddec0", rule: "Free listing. Under 250 votes." },
  { name: "Ruby", mark: "R", color: "#f07178", rule: "Starts at 250 votes." },
  { name: "Diamond", mark: "D", color: "#8eb0ff", rule: "Starts at 500 votes." },
]

function tierName(votes) {
  const count = Number(votes) || 0
  if (count >= 500) return "Diamond"
  if (count >= 250) return "Ruby"
  return "Emerald"
}

function Donut({ slices, caption, total }) {
  const r = 46
  const circ = 2 * Math.PI * r
  const sum = slices.reduce((acc, slice) => acc + slice.value, 0) || 1
  const parts = slices.filter((slice) => slice.value > 0)
  const gap = parts.length > 1 ? 4 : 0
  let cursor = 0
  const arcs = parts.map((slice) => {
    const raw = (slice.value / sum) * circ
    const len = Math.max(raw - gap, 1)
    const arc = { ...slice, len, offset: cursor }
    cursor += raw
    return arc
  })

  return (
    <svg className="holdDonut" viewBox="0 0 160 160" role="img" aria-label={caption + " " + total}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="#1c2128" strokeWidth="16" />
      {arcs.map((arc) => (
        <circle
          key={arc.id}
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth="16"
          strokeDasharray={arc.len + " " + (circ - arc.len)}
          strokeDashoffset={-arc.offset}
          transform="rotate(-90 80 80)"
        />
      ))}
      <text x="80" y="74" textAnchor="middle" className="holdDonutCaption">{caption}</text>
      <text x="80" y="96" textAnchor="middle" className="holdDonutValue">{total}</text>
    </svg>
  )
}

function Card({ tier, rows, totalVotes }) {
  const held = rows.reduce((sum, row) => sum + (Number(row.voteCount) || 0), 0)
  const pct = totalVotes > 0 ? (held / totalVotes) * 100 : 0
  const pctText = pct.toFixed(1).replace(/\.0$/, "") + "%"
  const slices = rows
    .map((row) => ({
      id: row.id,
      symbol: row.symbol || row.name,
      value: Number(row.voteCount) || 0,
      color: tokenAccent(row.id),
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <article className="holdCard">
      <header>
        <span className="holdTitle">
          <i style={{ background: tier.color }}>{tier.mark}</i>
          {tier.name}
        </span>
        <WalletLink to="/listings">View all</WalletLink>
      </header>
      <p className="holdRule">{tier.rule}</p>
      <div className="holdMeta">
        <span className="holdBar" aria-hidden="true">
          <b style={{ width: pct + "%", background: tier.color }} />
        </span>
        <strong style={{ color: tier.color }}>{pctText}</strong>
      </div>
      <p className="holdCount">{held.toLocaleString()} / {totalVotes.toLocaleString()} votes · {rows.length} {rows.length === 1 ? "listing" : "listings"}</p>
      <Donut slices={slices} caption={tier.name} total={held.toLocaleString()} />
      <ul className="holdLegend">
        {slices.map((slice) => (
          <li key={slice.id}>
            <i style={{ background: slice.color }} />
            <b>{slice.symbol}</b>
            <span>{slice.value.toLocaleString()} votes</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export const VoteHoldings = ({ rows }) => {
  const list = rows || []
  if (!list.length) return null
  const totalVotes = list.reduce((sum, row) => sum + (Number(row.voteCount) || 0), 0)

  return (
    <div className="holdGrid">
      {TIERS.map((tier) => (
        <Card
          key={tier.name}
          tier={tier}
          totalVotes={totalVotes}
          rows={list.filter((row) => tierName(row.voteCount) === tier.name)}
        />
      ))}
    </div>
  )
}

export default VoteHoldings
