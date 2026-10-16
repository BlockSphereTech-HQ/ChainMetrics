import React, { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../../context"
import { NotificationManager } from "../../helpers/notify"

export const PAGE_ACCESS_NOTICE = "Connect your wallet to access this page."

export function needsWallet(to) {
  const path = String(to || "").split("?")[0].split("#")[0]
  return path !== "" && path !== "/"
}

export function usePageAccess() {
  const { walletAddress, rememberPage } = useContext(AppContext)
  const navigate = useNavigate()

  const enterPage = (to) => {
    if (!needsWallet(to) || walletAddress) {
      navigate(to)
      return true
    }
    rememberPage(to)
    NotificationManager.info(PAGE_ACCESS_NOTICE)
    return false
  }

  return { walletAddress, enterPage }
}

export function WalletLink({ to, className, children }) {
  const { walletAddress, enterPage } = usePageAccess()

  if (!needsWallet(to) || walletAddress) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        enterPage(to)
      }}
    >
      {children}
    </Link>
  )
}

export default WalletLink
