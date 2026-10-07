import React from "react"
import "./ListingTable.css"
import { ListingInsightName } from "../ListingDiscovery/ListingDiscovery"

function ChangeCell({ value }) {
  if (isNaN(value)) {
    return (
      <div className="change24hDiv" style={{ color: "white" }}>
        <span>{value}</span>
      </div>
    )
  }
  if (value < 0) {
    return (
      <div className="change24hDiv" style={{ color: "#f87171" }}>
        <span>{`-${0 - value}%`}</span>
      </div>
    )
  }
  return (
      <div className="change24hDiv" style={{ color: "#4ade80" }}>
        <span>{`+${value}%`}</span>
    </div>
  )
}

export function ListingTable({
  caption,
  rows,
  insights,
  watchlistImg,
  nonwatchlistImg,
  onRowNavigate,
  onVote,
  onWatchlist,
  onOpenInsight,
}) {
  return (
    <div className="listingTableWrap">
      {caption ? <div className="listingTableCaption">{caption}</div> : null}
      <div className="listingTableScroll">
        <table className="listingTable">
          <thead>
            <tr>
              <th>Logo</th>
              <th className="listingTableSticky">Name</th>
              <th>Chain</th>
              <th>Market cap</th>
              <th>24h</th>
              <th>Listed</th>
              <th>Tier</th>
              <th>Votes</th>
              <th />
              <th>Watch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tokenId = row[10]
              return (
                <tr
                  key={tokenId}
                  onClick={(event) => {
                    if (
                      event.target.type === "submit" ||
                      event.target.type === "button" ||
                      event.target.type === "number" ||
                      event.target.src === watchlistImg ||
                      event.target.src === nonwatchlistImg ||
                      (event.target.closest && event.target.closest("[data-insight-control]"))
                    ) {
                      return
                    }
                    onRowNavigate(tokenId)
                  }}
                >
                  <td>
                    <div className="logoImgDiv">
                      <img src={row[0]} alt="" />
                    </div>
                  </td>
                  <td className="listingTableSticky">
                    <ListingInsightName
                      name={row[1]}
                      tokenId={tokenId}
                      votes={row[7]}
                      daily={row[11]}
                      weekly={row[12]}
                      insight={insights[tokenId]}
                      onOpen={() => onOpenInsight(tokenId)}
                    />
                  </td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>
                    <ChangeCell value={row[4]} />
                  </td>
                  <td>{row[5]}</td>
                  <td>
                    <div className="tierImgDiv">
                      <img src={row[6]} alt="" />
                    </div>
                  </td>
                  <td>{row[7]}</td>
                  <td>
                    <div className="voteBtnDiv">
                      <div className="voteBtnWrapped">
                        <button type="button" className="voteBtn" onClick={() => onVote(tokenId)}>
                          Vote
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="wlImgDiv" onClick={() => onWatchlist(tokenId)}>
                      <img className="wlImg" src={row[9]} alt="" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
