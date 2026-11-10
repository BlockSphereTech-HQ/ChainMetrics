import React, { useContext, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { AppContext } from "../../context"
import { NotificationManager } from "../../helpers/notify"
import { PAGE_ACCESS_NOTICE } from "../WalletLink/WalletLink"

/**
 * Other pages stay closed until a wallet connects from the header button.
 */
export function RequireWallet({ children }) {
  const { walletAddress, rememberPage } = useContext(AppContext)
  const location = useLocation()
  const notified = useRef("")

  useEffect(() => {
    if (walletAddress) return
    const next = location.pathname + location.search
    rememberPage(next)
    if (notified.current === next) return
    notified.current = next
    NotificationManager.info(PAGE_ACCESS_NOTICE)
  }, [walletAddress, location.pathname, location.search, rememberPage])

  if (!walletAddress) return null
  return children
}

export default RequireWallet
