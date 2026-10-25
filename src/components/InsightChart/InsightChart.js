import "./InsightChart.css"
import React from "react"

function formatCount(value) {
  const number = Number(value) || 0
  return number.toLocaleString()
}

function axisMax(values) {
  const peak = Math.max(1, ...values.map((value) => Math.abs(value)))
  const padded = peak * 1.25
  const steps = [2, 4, 5, 8, 10, 12, 16, 20, 25, 40, 50, 80, 100]
  return steps.find((step) => step >= padded) || Math.ceil(padded / 10) * 10
}

function formatChange(value) {
  if (value == null || value === "") return "Presale"
  const number = Number(value)
  if (!Number.isFinite(number)) return "Presale"
  const text = Math.abs(number).toFixed(1).replace(/\.0$/, "")
  if (number > 0) return "+" + text + "%"
  if (number < 0) return "-" + text + "%"
  return "0%"
}

export function InsightChange({ items, label }) {
  const rows = items || []
  const numbers = rows.map((item) => Number(item.value)).filter((value) => Number.isFinite(value))
  const axis = axisMax(numbers.length ? numbers : [4])
  const width = 640
  const hasIcons = rows.some((item) => item.icon)
  const padL = 42
  const padR = 16
  const plotTop = 24
  const plotBottom = hasIcons ? 158 : 136
  const symbolY = hasIcons ? 214 : plotBottom + 34
  const height = symbolY + 16
  const mid = (plotTop + plotBottom) / 2
  const half = (plotBottom - plotTop) / 2
  const gap = rows.length > 1 ? 14 : 0
  const barWidth = rows.length ? (width - padL - padR - gap * (rows.length - 1)) / rows.length : 0
  const ticks = [axis, axis / 2, 0, -axis / 2, -axis]

  const yFor = (value) => mid - (value / axis) * half

  return (
    <figure className="insightChartFigure">
      <svg
        className="insightChange"
        viewBox={"0 0 " + width + " " + height}
        style={{ aspectRatio: width + " / " + height }}
        role="img"
        aria-label={label || "24h change"}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={width - padR}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className={tick === 0 ? "insightZero" : "insightGrid"}
            />
            <text x={padL - 8} y={yFor(tick) + 4} textAnchor="end" className="insightAxis">
              {tick > 0 ? "+" : ""}
              {tick}%
            </text>
          </g>
        ))}
        {rows.map((item, index) => {
          const value = Number(item.value)
          const known = item.value != null && item.value !== "" && Number.isFinite(value)
          const x = padL + index * (barWidth + gap)
          const y = known ? yFor(value) : mid
          const barY = known ? Math.min(y, mid) : mid
          const barH = known ? Math.max(Math.abs(y - mid), value === 0 ? 0 : 2) : 0
          const labelY = !known ? plotBottom + 14 : value >= 0 ? Math.max(plotTop + 10, y - 6) : Math.min(plotBottom - 2, y + 14)
          return (
            <g key={item.id || item.label}>
              {known ? <rect x={x} y={barY} width={barWidth} height={barH} rx="2" fill={item.color || "#8eb0ff"} /> : null}
              <text x={x + barWidth / 2} y={labelY} textAnchor="middle" className="insightColumnValue">
                {formatChange(known ? value : null)}
              </text>
              {item.icon ? <image href={item.icon} x={x + barWidth / 2 - 13} y={178} width="26" height="26" /> : null}
              <text x={x + barWidth / 2} y={symbolY} textAnchor="middle" className="insightSymbol">
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function InsightColumns({ items, label }) {
  const rows = items || []
  const max = Math.max(1, ...rows.map((item) => Number(item.value) || 0))
  const width = 640
  const height = 168
  const padX = 16
  const gap = rows.length > 1 ? 14 : 0
  const barWidth = rows.length ? (width - padX * 2 - gap * (rows.length - 1)) / rows.length : 0

  return (
    <figure className="insightChartFigure">
      <svg className="insightColumns" viewBox={"0 0 " + width + " " + height} role="img" aria-label={label || "Stored votes"}>
        {rows.map((item, index) => {
          const value = Number(item.value) || 0
          const barHeight = Math.max(4, ((height - 28) * value) / max)
          const x = padX + index * (barWidth + gap)
          const y = height - 8 - barHeight
          return (
            <g key={item.id || item.label}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill={item.color || "#8eb0ff"} />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="insightColumnValue">
                {formatCount(value)}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="insightColumnLabels">
        {rows.map((item) => (
          <span key={item.id || item.label}>
            {item.icon ? <img src={item.icon} alt="" /> : null}
            {item.label}
          </span>
        ))}
      </div>
    </figure>
  )
}

export function InsightMeters({ items }) {
  const rows = items || []
  const max = Math.max(1, ...rows.map((item) => Number(item.max) || Number(item.value) || 0))
  return (
    <div className="insightMeters" role="img" aria-label="Vote counts">
      {rows.map((item) => {
        const value = Number(item.value) || 0
        const width = Math.max(value > 0 ? 4 : 0, (value / max) * 100)
        return (
          <div className="insightMeter" key={item.label}>
            <span>{item.label}</span>
            <div className="insightMeterTrack">
              <i style={{ width: width + "%", background: item.color || "#8eb0ff" }} />
            </div>
            <strong>{formatCount(value)}</strong>
          </div>
        )
      })}
    </div>
  )
}

export default InsightColumns
