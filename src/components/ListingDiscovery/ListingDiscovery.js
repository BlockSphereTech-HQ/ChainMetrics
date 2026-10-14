import "./ListingDiscovery.css"
import { PanelDialog } from "../ConfirmDialog/ConfirmDialog"
import { TokenIntelligence, TokenIntelligenceBoundary } from "../TokenIntelligence/TokenIntelligence"
import { listingVersion } from "../../helpers/tokenIntelligenceClient.js"
import { tokenAccent } from "../../helpers/insightSeries.js"
import { InsightMeters } from "../InsightChart/InsightChart"

export function ListingDiscoveryBar({ insightOnly, sortMode, lookupUnavailable, emptyInsight, onInsightOnly, onSort }) {
  const note =
    sortMode === "votes"
      ? "Ordered by stored vote count. This is not a Chain Metrics ranking."
      : sortMode === "change24h"
        ? "Ordered by the reported 24h change. Rows without a number stay at the bottom."
        : insightOnly && emptyInsight
          ? "No saved insights for the tokens in this list."
            : insightOnly
            ? "Showing tokens with a saved analysis."
            : ""

  return (
    <div className="listingDiscovery">
      <button type="button" aria-pressed={insightOnly} onClick={onInsightOnly}>
        Chain insight
      </button>
      <button type="button" aria-pressed={sortMode === "votes"} onClick={() => onSort("votes")}>
        Most votes
      </button>
      <button type="button" aria-pressed={sortMode === "change24h"} onClick={() => onSort("change24h")}>
        24h change
      </button>
      {sortMode !== "table" ? (
        <button type="button" onClick={() => onSort("table")}>
          Table order
        </button>
      ) : null}
      {note ? <p className="listingDiscoveryNote">{note}</p> : null}
    </div>
  )
}

export function ListingInsightName({ name, insight, tokenId, votes, daily, weekly, onOpen }) {
  const color = tokenAccent(tokenId)
  const stored = insight && insight.votes != null ? insight.votes : votes
  const day = insight && insight.daily != null ? insight.daily : daily
  const week = insight && insight.weekly != null ? insight.weekly : weekly
  return (
    <div className="listingInsightName">
      <span>{name}</span>
      <InsightMeters
        items={[
          { label: "Votes", value: stored, max: stored, color },
          { label: "Daily", value: day, max: stored, color },
          { label: "Weekly", value: week, max: stored, color },
        ]}
      />
      {insight ? (
        <button
          type="button"
          className="listingInsightBadge"
          data-insight-control="true"
          onClick={(event) => {
            event.stopPropagation()
            onOpen()
          }}
        >
          Open report
        </button>
      ) : null}
    </div>
  )
}

export function ListingInsightPanel({ open, tokenId, listing, onClose }) {
  return (
    <PanelDialog open={open} onClose={onClose} label="Chain Metrics">
      {open && tokenId ? (
        <TokenIntelligenceBoundary>
          <TokenIntelligence
            tokenId={tokenId}
            symbol={listing && listing.symbol}
            presale={listing && listing.presale}
            dataVersion={listingVersion(listing)}
          />
        </TokenIntelligenceBoundary>
      ) : null}
    </PanelDialog>
  )
}

export default ListingDiscoveryBar
