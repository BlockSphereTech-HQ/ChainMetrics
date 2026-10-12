import "./PromotePage.css"
import React, { useContext } from "react"
import { AppContext } from "../../context"
import { NotificationManager } from "../../helpers/notify"

export const PromotePage = () => {
  const { walletAddress } = useContext(AppContext)
  const buyPlacement = () => {
    if (!walletAddress) return
    NotificationManager.success("The connected wallet can continue this purchase.")
  }

  const packages = [
    { name: "Wide Header Banner", location: "Main Page", days: [
      { label: "1 day", price: "0.3 BNB" },
      { label: "3 days", price: "0.75 BNB" },
      { label: "7 days", price: "1.5 BNB" },
    ], specs: "600 x 240px | .jpg .png .gif | < 4 MB" },
    { name: "Rotating Header Banner", location: "Main Page", days: [
      { label: "1 day", price: "0.3 BNB" },
      { label: "3 days", price: "0.75 BNB" },
      { label: "7 days", price: "1.5 BNB" },
    ], specs: "600 x 240px | .jpg .png .gif | < 4 MB" },
    { name: "Coin Page Banner", location: "Coin Page", days: [
      { label: "1 day", price: "0.3 BNB" },
      { label: "3 days", price: "0.75 BNB" },
      { label: "7 days", price: "1.5 BNB" },
    ], specs: "600 x 240px | .jpg .png .gif | < 4 MB" },
    { name: "Trending Coin Section", location: "", days: [
      { label: "1 day", price: "0.3 BNB" },
      { label: "3 days", price: "0.75 BNB" },
      { label: "7 days", price: "1.5 BNB" },
    ], specs: "600 x 240px | .jpg .png .gif | < 4 MB" },
  ]

  return (
    <div className="promPage">
      <div className="promHeader">
        <p className="nxPrompt">Promotion</p>
        <h1 className="nxTitle">Promote a listed token</h1>
        <p className="nxLede">
          A placement is for a token already in the catalog. Choose a position on the main page, the token page, or the trending section, and a run of 1, 3, or 7 days. The connected wallet confirms the price. Votes and tier stay a community record.
        </p>
      </div>

      <div className="promGrid">
        {packages.map((pkg, idx) => (
          <div className="promCardOuter" key={idx}>
            <div className="promCard">
              <div className="promCardTop">
                <h3>{pkg.name}</h3>
                {pkg.location && <span className="promCardLocation">{pkg.location}</span>}
              </div>
              <div className="promCardPrices">
                {pkg.days.map((d, i) => (
                  <div className="promPriceRow" key={i}>
                    <span className="promDuration">{d.label}</span>
                    <span className="promPrice">{d.price}</span>
                  </div>
                ))}
              </div>
              <div className="promCardSpecs">{pkg.specs}</div>
              <button type="button" className="promBuyBtn" onClick={buyPlacement}>Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotePage
