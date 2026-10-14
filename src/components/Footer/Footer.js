import "./Footer.css"
import React from "react"
import { Link } from "react-router-dom"
import { WalletLink } from "../WalletLink/WalletLink"
import BrandMark from "../BrandMark/BrandMark"

export const Footer = () => {
  return (
    <footer className="siteFooter">
      <div className="footerInner">
        <div className="footerBrand">
          <div className="footerBrandMark">
            <BrandMark className="footerLogo" />
            <span className="footerBrandName">Chain Metrics</span>
          </div>
          <p className="footerTagline">
            On-chain token metrics. Public listings, community votes, and read-only analysis.
          </p>
        </div>

        <div className="footerColGroup">
          <div className="footerCol">
            <h4>Product</h4>
            <Link to="/">Overview</Link>
            <WalletLink to="/listings">Listings</WalletLink>
            <WalletLink to="/discover">Discovery</WalletLink>
            <WalletLink to="/intelligence">Intelligence</WalletLink>
            <WalletLink to="/listcoin">List a token</WalletLink>
          </div>
          <div className="footerCol">
            <h4>Network</h4>
            <WalletLink to="/treasury">Treasury</WalletLink>
            <WalletLink to="/promote">Promote</WalletLink>
            <span>Ethereum votes</span>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        <span>&copy; 2026 Chain Metrics.</span>
      </div>
    </footer>
  )
}

export default Footer
