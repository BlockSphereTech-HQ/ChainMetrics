import "./Discover.css"
import React from "react"
import DiscoveryPanel from "../../components/DiscoveryPanel/DiscoveryPanel"

export const Discover = () => {
  return (
    <section className="discoverPage">
      <header className="discoverHeader">
        <p className="nxPrompt">Discovery</p>
        <h1 className="nxTitle">Discovery</h1>
        <p className="nxLede">
          A question becomes a filter on the stored catalog. Matching tokens are listed from those records.
        </p>
      </header>
      <DiscoveryPanel />
    </section>
  )
}

export default Discover
