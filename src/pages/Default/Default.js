import "./Default.css"
import React, { useEffect, useState } from "react"
import Promoted from "../../components/PromotedCoins/Promoted"
import { database, isSampleCatalog } from "../../helpers/firebase"

export const Default = () => {
  const [sample, setSample] = useState(isSampleCatalog())

  useEffect(() => {
    const ref = database.ref("/coinlist")
    const onValue = () => setSample(isSampleCatalog())
    ref.on("value", onValue)
    return () => ref.off("value", onValue)
  }, [])

  return (
    <div className="dashboardPage">
      <section aria-labelledby="project-overview-title">
        <p className="nxPrompt">Catalog</p>
        <h1 id="project-overview-title" className="nxTitle">Public listings</h1>
        <p className="nxLede">
          {sample
            ? "Sample listings are loaded so the table and reports can be viewed. Opening a token, voting, or watching asks for a wallet."
            : "Market data, community sentiment, and on-chain signals for tokens listed on Chain Metrics."}
        </p>
      </section>
      <Promoted title="" caption="" />
    </div>
  )
}

export default Default
