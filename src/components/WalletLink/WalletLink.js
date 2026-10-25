import React, { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../../context"

export function WalletLink({ to, className, children }) {
  const { walletAddress, requestWallet } = useContext(AppContext)
  const navigate = useNavigate()

  return (
    <Link
      to={to}
      className={className}
      onClick={async (event) => {
        if (walletAddress) return
        event.preventDefault()
        const address = await requestWallet("connect")
        if (address) navigate(to)
      }}
    >
      {children}
    </Link>
  )
}

export default WalletLink
