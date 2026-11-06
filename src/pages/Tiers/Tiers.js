import TierCard from "../../components/TierCard/TierCard"

import emeraldImg from "../../assets/img/emerald.png"
import rubyImg from "../../assets/img/ruby.png"
import diamondImg from "../../assets/img/diamond.png"

import { useLocation } from "react-router-dom"
import React from "react"
import { sampleListing } from "../../helpers/sampleCatalog"

import "./Tiers.css"

export const Tiers = () => {
  const location = useLocation()
  const fallback = sampleListing("lumen")
  const listingInfo = location.state && location.state.info ? location.state.info : fallback.info
  const id = location.state && location.state.id != null ? location.state.id : fallback.id

  const EmeraldTier = {
    headerString: "Emerald Tier",
    color: "#22c55e",
    buyAmount: "FREE",
    buyAmountInt: 0,
    nitrogemAmount: 0,
    image: emeraldImg,
    mainStrings: [
      "Listing on Chain Metrics",
      "Upgradable to Ruby or Diamond tier at any time",
      "Promotable on Chain Metrics",
    ],
  }

  const RubyTier = {
    headerString: "Ruby Tier",
    color: "#ef4444",
    buyAmount: "0.5 BNB",
    buyAmountInt: "0.5",
    nitrogemAmount: 250,
    image: rubyImg,
    mainStrings: [
      "Notification sent to Telegram channel (6K+ members)",
      "250 Votes included",
      "5% discount on advertising packages",
      "Included in Chain Metrics discovery",
      "Promotable on Chain Metrics",
    ],
  }

  const DiamondTier = {
    headerString: "Diamond Tier",
    color: "#8eb0ff",
    buyAmount: "1 BNB",
    buyAmountInt: "1",
    nitrogemAmount: 500,
    image: diamondImg,
    mainStrings: [
      "Sent to 12+ Telegram channels (20K+ members)",
      "Qualifies for the Chain Metrics buyback and burn competition",
      "500 Votes included",
      "10% discount on advertising packages",
      "Included in Chain Metrics discovery",
    ],
  }

  return (
    <div className="tiersPage">
      <div className="tiersHeader">
        <p className="nxPrompt">Tiers</p>
        <h1 className="nxTitle">Listing tiers</h1>
        <p className="nxLede">Emerald, Ruby, and Diamond for this token listing.</p>
      </div>
      <div className="tiersGrid">
        <TierCard type="emerald" data={EmeraldTier} info={listingInfo} id={id} />
        <TierCard type="ruby" data={RubyTier} info={listingInfo} id={id} />
        <TierCard type="diamond" data={DiamondTier} info={listingInfo} id={id} />
      </div>
    </div>
  )
}

export default Tiers
