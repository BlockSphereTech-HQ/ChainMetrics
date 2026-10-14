import auroraLogo from "../assets/img/tokens/aurora.svg"
import lumenLogo from "../assets/img/tokens/lumen.svg"
import prismLogo from "../assets/img/tokens/prism.svg"
import helixLogo from "../assets/img/tokens/helix.svg"
import novaLogo from "../assets/img/tokens/nova.svg"
import orbitLogo from "../assets/img/tokens/orbit.svg"

const DAY = 86400

function ago(days) {
  return Math.floor(Date.now() / 1000) - days * DAY
}

function token(fields) {
  return {
    promoted: 1,
    presale: false,
    kyc: "Verified",
    audit: "Reviewed",
    videolink: "",
    chartlink: "",
    telegramlink: "https://t.me/chainmetrics",
    twitterlink: "https://x.com",
    websitelink: "https://example.com",
    swaplink: "",
    contactemail: "listings@chainmetrics.example",
    discordlink: "",
    cmclink: "",
    watchlist: "",
    ...fields,
  }
}

let sampleStore = null

export function createSampleStore() {
  if (sampleStore) return sampleStore
  const recent = ago(0.2)
  sampleStore = {
    coinlist: {
      aurora: token({
        name: "Aurora Relay",
        symbol: "AUR",
        network: "ETH",
        logo: auroraLogo,
        contractAddr: "0x1111111111111111111111111111111111111111",
        description: "A sample Ethereum listing used to show votes, tier progress, and market figures.",
        voteCount: 86,
        dailyCount: 9,
        dailyStart: recent,
        weeklyCount: 22,
        weeklyStart: ago(1),
        listed: ago(2),
        launch: ago(40),
        watchlist: "0xaaaa000000000000000000000000000000000001,0xaaaa000000000000000000000000000000000002,",
      }),
      lumen: token({
        name: "Lumen Gate",
        symbol: "LUMEN",
        network: "BSC",
        logo: lumenLogo,
        contractAddr: "0x2222222222222222222222222222222222222222",
        description: "A sample BSC listing close to the Ruby tier, with an active weekly vote window.",
        voteCount: 228,
        dailyCount: 3,
        dailyStart: recent,
        weeklyCount: 15,
        weeklyStart: ago(2),
        listed: ago(12),
        launch: ago(80),
        kyc: "Pending",
        watchlist: "0xbbbb000000000000000000000000000000000001,0xbbbb000000000000000000000000000000000002,0xbbbb000000000000000000000000000000000003,0xbbbb000000000000000000000000000000000004,",
      }),
      prism: token({
        name: "Prism Ledger",
        symbol: "PRISM",
        network: "ETH",
        logo: prismLogo,
        contractAddr: "0x3333333333333333333333333333333333333333",
        description: "A sample listing approaching the Diamond tier.",
        voteCount: 476,
        dailyCount: 2,
        dailyStart: recent,
        weeklyCount: 11,
        weeklyStart: ago(3),
        listed: ago(30),
        launch: ago(120),
        audit: "In review",
        watchlist: "0xcccc000000000000000000000000000000000001,",
      }),
      helix: token({
        name: "Helix Node",
        symbol: "HELIX",
        network: "BSC",
        logo: helixLogo,
        contractAddr: "0x4444444444444444444444444444444444444444",
        description: "A sample Diamond listing added this week.",
        voteCount: 540,
        dailyCount: 7,
        dailyStart: recent,
        weeklyCount: 19,
        weeklyStart: ago(1),
        listed: ago(1),
        launch: ago(20),
        watchlist: "0xdddd000000000000000000000000000000000001,",
      }),
      nova: token({
        name: "Nova Presale",
        symbol: "NOVA",
        network: "ETH",
        logo: novaLogo,
        contractAddr: "0x5555555555555555555555555555555555555555",
        description: "A sample presale listing. Market quotes stay hidden until trading starts.",
        presale: true,
        voteCount: 12,
        dailyCount: 0,
        dailyStart: ago(5),
        weeklyCount: 0,
        weeklyStart: ago(20),
        listed: ago(4),
        launch: ago(4),
        kyc: "Not started",
        audit: "Not started",
      }),
      orbit: token({
        name: "Orbit Yield",
        symbol: "ORBIT",
        network: "BSC",
        logo: orbitLogo,
        contractAddr: "0x6666666666666666666666666666666666666666",
        description: "An older sample listing with no votes in the current windows.",
        voteCount: 40,
        dailyCount: 0,
        dailyStart: ago(10),
        weeklyCount: 0,
        weeklyStart: ago(21),
        listed: ago(40),
        launch: ago(200),
      }),
    },
    votelimit: {},
  }
  return sampleStore
}

const QUOTES = {
  AUR: { market_cap: 8400000, percent_change_24h: 6.4, price: 0.084, circulating_supply: 100000000 },
  LUMEN: { market_cap: 42000000, percent_change_24h: -2.1, price: 1.25, circulating_supply: 33600000 },
  PRISM: { market_cap: 18000000, percent_change_24h: 12.8, price: 0.42, circulating_supply: 42857142 },
  HELIX: { market_cap: 155000000, percent_change_24h: 1.4, price: 3.1, circulating_supply: 50000000 },
  ORBIT: { market_cap: 2100000, percent_change_24h: -8.2, price: 0.018, circulating_supply: 116666666 },
  ETH: { market_cap: 386000000000, percent_change_24h: 0.8, price: 3210, circulating_supply: 120200000 },
}

export function sampleQuote(symbol) {
  return QUOTES[symbol] || null
}

export function sampleListing(id) {
  const store = createSampleStore()
  const info = store.coinlist[id] || store.coinlist.lumen
  return { id: store.coinlist[id] ? id : "lumen", info }
}

export function sampleInsights() {
  const store = createSampleStore()
  return Object.keys(store.coinlist).map((tokenId) => {
    const row = store.coinlist[tokenId]
    return {
      tokenId,
      summary: row.name + " has " + row.voteCount + " stored votes, " + row.dailyCount + " in the daily window, and " + row.weeklyCount + " in the weekly window.",
      dataQuality: "partial",
      analyzedAt: Date.now(),
      votes: row.voteCount,
      daily: row.dailyCount,
      weekly: row.weeklyCount,
    }
  })
}

function pair(observed, interpretation) {
  return { observed, interpretation }
}

export function sampleAnalysis(tokenId) {
  const store = createSampleStore()
  const row = store.coinlist[tokenId]
  if (!row) return null
  const quote = QUOTES[row.symbol]
  return {
    disclaimer: "Sample report. Chain Metrics insights are informational and are not financial advice.",
    dataQuality: "partial",
    executiveSummary: pair(
      row.name + " has " + row.voteCount + " stored votes on " + row.network + ".",
      "This readout uses the sample catalog, not a live market feed."
    ),
    communityActivity: {
      votingActivity: pair(String(row.voteCount) + " stored votes.", "The count is the sample record for this listing."),
      votingMomentum: pair(String(row.dailyCount) + " votes in the current daily window.", "A single snapshot does not prove the count is rising."),
      communityParticipation: pair(String(row.weeklyCount) + " votes in the current weekly window.", "Watchlist size is stored entries, not holders."),
      unusualChanges: pair("No unusual change is stored in the sample record.", "Nothing here is a price forecast."),
    },
    marketContext: {
      available: Boolean(quote) && row.presale !== true,
      price: quote ? quote.price : null,
      marketCap: quote ? quote.market_cap : null,
      priceChange: quote ? quote.percent_change_24h : null,
      volume: null,
      liquidity: null,
      ...pair(
        row.presale ? "Presale listing. No trade quote is attached." : "Sample quote for " + row.symbol + ".",
        "Quote figures are sample values so the market card can render."
      ),
    },
    listingProgress: {
      currentTier: row.voteCount >= 500 ? "Diamond" : row.voteCount >= 250 ? "Ruby" : "Emerald",
      nextTier: row.voteCount >= 500 ? "Diamond" : row.voteCount >= 250 ? "Diamond" : "Ruby",
      voteCount: row.voteCount,
      votesRemaining: row.voteCount >= 500 ? 0 : row.voteCount >= 250 ? 500 - row.voteCount : 250 - row.voteCount,
      ethAlternative: null,
      perVoteEth: "0.0035",
      ...pair("Tier labels use stored votes. Ruby is 250 and Diamond is 500.", "The sample listing can be opened, voted, and upgraded without a wallet."),
    },
    notableSignals: {
      positive: ["Stored votes are present on the sample record."],
      neutral: ["Market figures are sample quotes."],
      caution: ["This is not a live listing and is not financial advice."],
    },
    dataQualityReport: {
      level: "partial",
      available: ["voteCount", "dailyCount", "weeklyCount", "network"],
      missing: ["live holders"],
      timestamps: { normalizedAt: Date.now() },
    },
    activityChart: {
      votes: row.voteCount,
      daily: row.dailyCount,
      weekly: row.weeklyCount,
    },
    explanation: pair(
      "The page is reading the sample catalog for " + row.name + ".",
      "Connect a catalog later to replace these records. Wallet actions stay optional."
    ),
  }
}
