import { database } from "./firebase"
import { rowsFromCatalog } from "./catalogMetrics"

const RUBY = 250
const DIAMOND = 500
const DAY = 86400

function remaining(voteCount) {
  if (voteCount == null) return null
  if (voteCount >= DIAMOND) return 0
  if (voteCount >= RUBY) return DIAMOND - voteCount
  return RUBY - voteCount
}

function fresh(start, now, maxAge) {
  if (start == null) return false
  const age = now - start
  return age >= 0 && age <= maxAge
}

function publicToken(row, reason) {
  return {
    id: row.id,
    name: row.name,
    symbol: row.symbol,
    network: row.network,
    tier: row.tier,
    voteCount: row.voteCount,
    dailyCount: row.dailyCount,
    weeklyCount: row.weeklyCount,
    watchlistCount: row.watchlistCount,
    listed: row.listed,
    votesRemaining: remaining(row.voteCount),
    reason,
  }
}

const STORED_RULES = [
  /next tier|approaching/,
  /recently listed|just listed|new listing|recent listing|listed tokens/,
  /participation|watchlist/,
  /momentum/,
  /community activity|increasing activity|\bactivity\b/,
]

export function matchesStoredDiscovery(question) {
  const text = String(question || "").toLowerCase()
  return STORED_RULES.some((rule) => rule.test(text))
}

function filterRows(rows, question, now) {
  const text = question.toLowerCase()
  if (!matchesStoredDiscovery(text)) return null
  if (/next tier|approaching/.test(text)) {
    const tokens = rows
      .map((row) => {
        const left = remaining(row.voteCount)
        if (left == null || left <= 0 || left > 50) return null
        return publicToken(row, left + " stored votes remain until the next catalog tier.")
      })
      .filter(Boolean)
      .sort((a, b) => a.votesRemaining - b.votesRemaining)
    return {
      methodology: "Approaching the next tier uses stored votes. Ruby is 250 and Diamond is 500. A listing matches when 1 to 50 votes remain.",
      tokens,
    }
  }
  if (/recently listed|just listed|new listing|recent listing|listed tokens/.test(text)) {
    const tokens = rows
      .filter((row) => fresh(row.listed, now, 7 * DAY))
      .sort((a, b) => b.listed - a.listed)
      .map((row) => publicToken(row, "The stored listing time is within the last 7 days."))
    return {
      methodology: "Recently listed uses the stored listing time from the last 7 days.",
      tokens,
    }
  }
  if (/participation|watchlist/.test(text)) {
    const tokens = rows
      .filter((row) => row.watchlistCount >= 3 && row.weeklyCount > 0 && fresh(row.weeklyStart, now, 14 * DAY))
      .sort((a, b) => b.watchlistCount - a.watchlistCount)
      .map((row) => publicToken(row, row.watchlistCount + " watchlist entries are stored, with votes in the current weekly window."))
    return {
      methodology: "Strong participation requires at least 3 watchlist entries and a weekly vote count inside the last 14 days.",
      tokens,
    }
  }
  if (/momentum/.test(text)) {
    const tokens = rows
      .filter((row) => row.dailyCount > 0 && fresh(row.dailyStart, now, 2 * DAY))
      .sort((a, b) => b.dailyCount - a.dailyCount)
      .map((row) => publicToken(row, row.dailyCount + " votes are stored in the current daily window."))
    return {
      methodology: "Voting momentum uses the stored daily vote count from a window that started within the last 2 days.",
      tokens,
    }
  }
  if (/community activity|increasing activity|\bactivity\b/.test(text)) {
    const tokens = rows
      .filter((row) => row.weeklyCount > 0 && fresh(row.weeklyStart, now, 14 * DAY))
      .sort((a, b) => b.weeklyCount - a.weeklyCount)
      .map((row) => publicToken(row, row.weeklyCount + " votes are stored in the current weekly window."))
    return {
      methodology: "Community activity uses the stored weekly vote count from a window that started within the last 14 days.",
      tokens,
    }
  }
  return null
}

export async function localDiscover(question) {
  const snapshot = await database.ref("/coinlist").get()
  const rows = rowsFromCatalog(snapshot.exists() ? snapshot.val() : {})
  const now = Math.floor(Date.now() / 1000)
  const matched = filterRows(rows, question, now)
  if (!matched) {
    return {
      supported: false,
      tokens: [],
      methodology: "",
      explanation: "That question is outside the catalog filters. Try votes, recent listings, tier progress, or watchlist participation.",
      disclaimer: "Not financial advice.",
    }
  }
  const names = matched.tokens.map((token) => token.name || token.symbol || token.id).slice(0, 8)
  const explanation =
    (matched.tokens.length ? matched.tokens.length + " listings matched: " + names.join(", ") + "." : "No catalog records matched this rule.") +
    " Not financial advice."
  return {
    supported: true,
    tokens: matched.tokens,
    methodology: matched.methodology,
    explanation,
    disclaimer: "Not financial advice.",
  }
}
