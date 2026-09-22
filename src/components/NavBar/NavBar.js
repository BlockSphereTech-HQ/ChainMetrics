import "./NavBar.css"

import React, { useEffect, useContext, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import BrandMark from "../BrandMark/BrandMark"

import { getWeb3Eip1193Provider } from "../../helpers/activeWeb3Provider"
import { NotificationManager } from "../../helpers/notify"
import { AppContext } from "../../context"

export const NavBar = () => {
  const { walletAddress, handleWalletAddress, handleDisconnectWallet, requestWallet } = useContext(AppContext)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    let cancel = false
    import("../../helpers/wallet").then(({ getCurrentWalletConnected }) =>
      getCurrentWalletConnected().then(({ address }) => {
        if (!cancel && address) handleWalletAddress(address)
      })
    )
    return () => {
      cancel = true
    }
  }, [handleWalletAddress])

  useEffect(() => {
    const eth = getWeb3Eip1193Provider()
    if (!eth || !eth.on) return undefined

    const onAccountsChanged = (accounts) => {
      if (accounts.length) {
        handleWalletAddress(accounts[0])
      } else {
        void handleDisconnectWallet()
      }
    }

    const onChainChanged = () => {
      window.location.reload()
    }

    eth.on("accountsChanged", onAccountsChanged)
    eth.on("chainChanged", onChainChanged)

    return () => {
      if (eth.removeListener) {
        eth.removeListener("accountsChanged", onAccountsChanged)
        eth.removeListener("chainChanged", onChainChanged)
      }
    }
  }, [walletAddress, handleWalletAddress, handleDisconnectWallet])

  const onDisconnectWalletHandler = async () => {
    await handleDisconnectWallet()
    setMobileOpen(false)
    navigate("/", { replace: true })
    NotificationManager.info("Wallet disconnected")
  }

  const guard = (event, to) => {
    setMobileOpen(false)
    if (walletAddress) return
    event.preventDefault()
    requestWallet("connect").then((address) => {
      if (address) navigate(to)
    })
  }

  const walletLabel = () => {
    if (walletAddress === "") return "Connect wallet"
    return walletAddress.substring(0, 6) + "..." + walletAddress.substring(38)
  }

  const walletAction = () => {
    if (walletAddress === "") return () => requestWallet("connect")
    return onDisconnectWalletHandler
  }

  return (
    <nav className="navBar">
      <div className="navInner">
        {/* Logo */}
        <div className="navLogo" onClick={() => navigate("/")}>
          <BrandMark className="navBrandMark" />
          <span className="navBrandName">Chain Metrics</span>
        </div>

        {/* Desktop Links */}
        <div className={`navLinks ${mobileOpen ? "navLinksOpen" : ""}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={() => setMobileOpen(false)}>Overview</NavLink>
          <NavLink to="/listings" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/listings")}>Listings</NavLink>
          <NavLink to="/discover" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/discover")}>Discovery</NavLink>
          <NavLink to="/intelligence" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/intelligence")}>Intelligence</NavLink>
          <NavLink to="/treasury" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/treasury")}>Treasury</NavLink>
          <NavLink to="/promote" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/promote")}>Promote</NavLink>
          <NavLink to="/listcoin" className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")} onClick={(event) => guard(event, "/listcoin")}>List</NavLink>
        </div>

        {/* Right Actions */}
        <div className="navActions">
          <button className="navWalletBtn" onClick={walletAction()}>
            {walletAddress ? walletLabel() : "Connect wallet"}
          </button>
          {/* Mobile hamburger */}
          <button className="navHamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
