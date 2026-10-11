import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import "./Mainpage.css"

import NavBar from "../../components/NavBar/NavBar.js"
import StatusTicker from "../../components/StatusTicker/StatusTicker.js"
import Footer from "../../components/Footer/Footer.js"
import { WalletProvider } from "../../context"
import { RequireWallet } from "../../components/RequireWallet/RequireWallet"

const Home = lazy(() => import("../Home/Home.js"))
const Default = lazy(() => import("../Default/Default.js"))
const Listcoin = lazy(() => import("../Listcoin/Listcoin.js"))
const Tiers = lazy(() => import("../Tiers/Tiers.js"))
const Details = lazy(() => import("../../pages/Details/Details"))
const Treasury = lazy(() => import("../Treasury/Treasury.js"))
const PromotePage = lazy(() => import("../../pages/PromotePage/PromotePage.js"))
const Discover = lazy(() => import("../Discover/Discover.js"))
const Intelligence = lazy(() => import("../Intelligence/Intelligence.js"))

const PageFallback = () => <div className="routeFallback">Loading...</div>

const MainShell = () => (
  <div className="mainPage">
    <div className="siteHeader">
      <StatusTicker />
      <NavBar />
    </div>
    <div className="mainDiv">
      <Outlet />
    </div>
    <Footer />
    <button
      type="button"
      className="nxTop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  </div>
)

export const Mainpage = () => {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainShell />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Home />
                </Suspense>
              }
            />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route
              path="/listings"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Default />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/listcoin"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Listcoin data="" />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/tiers"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Tiers />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/details/:id"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Details />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/treasury"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Treasury />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/intelligence"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Intelligence />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route
              path="/discover"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <Discover />
                  </Suspense>
                </RequireWallet>
              }
            />
            <Route path="/levelup" element={<Navigate to="/listings" replace />} />
            <Route
              path="/promote"
              element={
                <RequireWallet>
                  <Suspense fallback={<PageFallback />}>
                    <PromotePage />
                  </Suspense>
                </RequireWallet>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default Mainpage
