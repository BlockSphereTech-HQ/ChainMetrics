import "./WalletDashboard.css"

import React, { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import BrandMark from "../../components/BrandMark/BrandMark"
import { AppContext } from "../../context"
import { connectWithProvider } from "../../helpers/wallet"
import { describeInjectedWallets } from "../../helpers/injectedWallets"
import { NotificationManager } from "../../helpers/notify"
import WalletBrandIcon from "../../components/WalletBrandIcon/WalletBrandIcon"

const INSTALL_WALLETS = [
  { name: "MetaMask", href: "https://metamask.io/download/" },
  { name: "Rabby", href: "https://rabby.io/" },
  { name: "Phantom", href: "https://phantom.app/download" },
]

export const WalletDashboard = () => {
  const navigate = useNavigate()
  const { handleWalletAddress } = useContext(AppContext)
  const [wallets, setWallets] = useState([])
  const [connectingName, setConnectingName] = useState("")
  const [walletOpen, setWalletOpen] = useState(false)

  const refreshWallets = useCallback(() => {
    setWallets(describeInjectedWallets())
  }, [])

  useEffect(() => {
    refreshWallets()
    const onFocus = () => refreshWallets()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refreshWallets])

  useEffect(() => {
    if (!walletOpen) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setWalletOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [walletOpen])

  const openWalletModal = () => {
    refreshWallets()
    setWalletOpen(true)
  }

  const onPickWallet = async (provider, name) => {
    setConnectingName(name)
    try {
      const res = await connectWithProvider(provider)
      handleWalletAddress(res.address)
      if (!res.address) {
        NotificationManager.warning(res.status || "Could not connect wallet.")
      } else {
        NotificationManager.success(`Connected with ${name}`)
        navigate("/home", { replace: true })
      }
    } catch (e) {
      NotificationManager.error(e?.message || "Connection error")
    } finally {
      setConnectingName("")
    }
  }

  return (
    <div className="walletDashboardPage">
      <div className="walletDashboardBg" aria-hidden="true" />

      <header className="walletTop">
        <div className="walletWordmark">
          <BrandMark />
          <span>Chain Metrics</span>
        </div>
      </header>

      <div className="walletStage">
        <div className="walletLayout">
          <section className="walletOverview" aria-labelledby="wallet-overview-title">
            <p className="walletBadge">
              <i aria-hidden="true" />
              On-chain analytics
            </p>
            <h1 id="wallet-overview-title" className="walletIntro">
              Read token markets as <span className="walletAccent">Chain Metrics</span>.
            </h1>
            <p className="walletBody">
              Market quotes, community votes, and on-chain activity sit in one visual catalog. <span className="walletName">Chain Metrics</span> turns those records into listing summaries, momentum comparisons, and read-only reports.
            </p>
            <button type="button" className="walletConnectBtn" onClick={openWalletModal}>
              <span className="walletConnectArrow" aria-hidden="true">&gt;</span>
              Connect wallet
            </button>
            <ul className="walletStats">
              <li>
                <strong>Public</strong>
                <span>listings</span>
              </li>
              <li>
                <strong>Votes</strong>
                <span>on-chain</span>
              </li>
              <li>
                <strong>AI</strong>
                <span>read-only</span>
              </li>
            </ul>
          </section>

          <figure className="metricBoard" aria-label="Chain Metrics signal board">
            <div className="metricBoardHead">
              <span>Signal board</span>
              <span className="metricLive"><i aria-hidden="true" /> Live view</span>
            </div>
            <div className="metricTiles">
              <div className="metricTile">
                <span>Listings</span>
                <strong>Public</strong>
                <svg className="spark" viewBox="0 0 120 36" aria-hidden="true">
                  <path d="M2 28 L18 24 L32 26 L48 16 L64 18 L80 10 L100 12 L118 6" fill="none" stroke="#6d97ff" strokeWidth="2" />
                </svg>
              </div>
              <div className="metricTile">
                <span>Votes</span>
                <strong>On-chain</strong>
                <svg className="spark" viewBox="0 0 120 36" aria-hidden="true">
                  <path d="M2 30 L20 22 L36 24 L52 14 L70 16 L88 8 L118 10" fill="none" stroke="#3ddec0" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <ul className="metricRows">
              <li><span>Listings</span><i style={{ width: "92%" }} /><em>catalog</em></li>
              <li><span>Votes</span><i style={{ width: "74%" }} /><em>on-chain</em></li>
              <li><span>Discovery</span><i style={{ width: "63%" }} /><em>filters</em></li>
              <li><span>Reports</span><i style={{ width: "48%" }} /><em>read-only</em></li>
            </ul>
            <p className="metricFoot">Surfaces in the catalog. Not a price forecast.</p>
          </figure>
        </div>
      </div>

      {walletOpen ? (
        <div className="walletModalBackdrop" onClick={() => setWalletOpen(false)}>
          <div
            className="walletDashboardPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="walletDashboardPanelGlow" aria-hidden="true" />
            <div className="walletDashboardPanelHeader">
              <div className="walletDashboardTitleIcon">
                <BrandMark className="walletModalMark" />
              </div>
              <button type="button" className="walletModalClose" onClick={() => setWalletOpen(false)} aria-label="Close">
                ×
              </button>
              <h2 id="wallet-modal-title" className="walletDashboardPanelTitle">Connect a wallet</h2>
              <p className="walletDashboardPanelLead">Choose a wallet to open the catalog.</p>
            </div>
            <div className="walletDashboardDivider" />
            {wallets.length > 0 ? (
              <>
                <p className="walletDashboardSectionLabel">Select wallet</p>
                <div className="walletDashboardOptionGrid">
                  {wallets.map(({ provider, name }, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="walletDashboardOptionBtn"
                      disabled={Boolean(connectingName)}
                      onClick={() => onPickWallet(provider, name)}
                    >
                      <WalletBrandIcon name={name} />
                      <span className="walletDashboardOptionText">
                        <span className="walletDashboardOptionName">
                          {connectingName === name ? "Connecting…" : name}
                        </span>
                        <span className="walletDashboardOptionHint">
                          {connectingName === name ? "Approve in your wallet" : "Click to connect"}
                        </span>
                      </span>
                      <span className="walletDashboardOptionArrow" aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="walletDashboardSectionLabel">Install a wallet</p>
                <p className="walletDashboardHint">
                  No Ethereum wallet detected. Install one below, then refresh this page.
                </p>
                <div className="walletDashboardOptionGrid">
                  {INSTALL_WALLETS.map(({ name, href }) => (
                    <a
                      key={name}
                      className="walletDashboardOptionBtn walletDashboardInstallBtn"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WalletBrandIcon name={name} />
                      <span className="walletDashboardOptionText">
                        <span className="walletDashboardOptionName">Get {name}</span>
                        <span className="walletDashboardOptionHint">Install extension</span>
                      </span>
                      <span className="walletDashboardOptionArrow" aria-hidden="true">›</span>
                    </a>
                  ))}
                </div>
              </>
            )}
            <div className="walletDashboardPanelFooter">
              <span>Intelligence · Discovery · On-chain votes</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default WalletDashboard
