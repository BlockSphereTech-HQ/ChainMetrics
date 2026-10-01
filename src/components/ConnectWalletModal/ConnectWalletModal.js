import "./ConnectWalletModal.css"
import React, { useEffect, useState } from "react"
import { connectWithProvider } from "../../helpers/wallet"
import { describeInjectedWallets } from "../../helpers/injectedWallets"
import { NotificationManager } from "../../helpers/notify"
import WalletBrandIcon, { getWalletIcon } from "../WalletBrandIcon/WalletBrandIcon"
import okxIcon from "../../assets/img/wallets/okx.svg"

const WALLET_COPY = {
  details: {
    title: "View this token",
    reason: "The full page includes the report, votes, and watch status for the connected wallet.",
  },
  vote: {
    title: "Cast your vote",
    reason: "Each connected wallet can place one vote.",
  },
  watch: {
    title: "Save this token",
    reason: "The watchlist is stored for the connected wallet.",
  },
  discover: {
    title: "Search in your own words",
    reason: "Suggested prompts stay open. A custom question continues with a connected wallet.",
  },
  promote: {
    title: "Continue this purchase",
    reason: "The listed price is confirmed and paid in the connected wallet.",
  },
  list: {
    title: "Submit this listing",
    reason: "The listing is sent with the connected wallet, then you choose a tier.",
  },
  connect: {
    title: "Connect Wallet",
    reason: "Continue to the full catalog. Listings, Discovery, and the other sections open from here.",
  },
}

const INSTALL_OPTIONS = [
  { name: "MetaMask", href: "https://metamask.io/download/" },
  { name: "Rabby", href: "https://rabby.io/" },
  { name: "Phantom", href: "https://phantom.com/download" },
  { name: "OKX Wallet", href: "https://www.okx.com/web3", icon: okxIcon },
  { name: "Coinbase Wallet", href: "https://www.coinbase.com/wallet" },
  { name: "Trust Wallet", href: "https://trustwallet.com/download" },
  { name: "Brave Wallet", href: "https://brave.com/wallet/" },
]

export const ConnectWalletModal = ({ open, reason = "connect", onClose, onConnected }) => {
  const [installed, setInstalled] = useState([])
  const [pending, setPending] = useState("")

  useEffect(() => {
    if (!open) return undefined
    setInstalled(describeInjectedWallets())
    setPending("")
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const copy = WALLET_COPY[reason] || WALLET_COPY.connect

  const connectInstalled = async (wallet) => {
    setPending(wallet.name)
    const result = await connectWithProvider(wallet.provider)
    setPending("")
    if (result.address) {
      onConnected(result.address)
      return
    }
    if (result.status) NotificationManager.warning(result.status)
  }

  return (
    <div className="walletModalRoot" role="presentation" onMouseDown={onClose}>
      <div
        className="walletModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        aria-describedby="wallet-modal-reason"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="walletModalHead">
          <h2 id="wallet-modal-title">{copy.title}</h2>
          <button type="button" className="walletModalClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p id="wallet-modal-reason" className="walletModalReason">{copy.reason}</p>
        {installed.length ? null : (
          <p className="walletModalLede">Install the one you prefer, then return to this page.</p>
        )}
        {installed.length ? (
          <ul className="walletModalList">
            {installed.map((wallet) => (
              <li key={wallet.name}>
                <button type="button" onClick={() => connectInstalled(wallet)} disabled={pending !== ""}>
                  <WalletBrandIcon name={wallet.name} />
                  <span>{pending === wallet.name ? "Waiting for approval" : wallet.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="walletModalList">
            {INSTALL_OPTIONS.map((wallet) => (
              <li key={wallet.name}>
                <a href={wallet.href} target="_blank" rel="noreferrer">
                  <span className="walletBrandIcon">
                    <img src={wallet.icon || getWalletIcon(wallet.name)} alt="" />
                  </span>
                  <span>Install {wallet.name}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ConnectWalletModal
