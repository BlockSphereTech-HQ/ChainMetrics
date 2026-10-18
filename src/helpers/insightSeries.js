const ACCENTS = {
  aurora: "#f5c16c",
  lumen: "#fbbf24",
  prism: "#a78bfa",
  helix: "#2dd4bf",
  nova: "#fb7185",
  orbit: "#38bdf8",
}

const DIAMOND = 500

export function tokenAccent(id) {
  return ACCENTS[id] || "#8eb0ff"
}

export function tierCap(votes) {
  const count = Number(votes) || 0
  if (count >= DIAMOND) return DIAMOND
  return count >= 250 ? DIAMOND : 250
}
