import React, { useEffect, useState } from "react"
import { subscribeNotifications } from "../../helpers/notify"
import "./NotifyToast.css"

const KINDS = {
  info: "Notice",
  success: "Confirmed",
  warning: "Attention",
  error: "Unable",
}

export function NotificationContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    return subscribeNotifications((entry) => {
      setItems((current) => [...current.slice(-4), entry])
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== entry.id))
      }, 4200)
    })
  }, [])

  if (!items.length) return null

  return (
    <div className="notifyToastStack" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`notifyToast notifyToast-${item.type}`} role="status">
          <span className="notifyToastBorder" aria-hidden="true" />
          <div className="notifyToastBody">
            <span className="notifyToastMark" aria-hidden="true" />
            <div className="notifyToastCopy">
              <span className="notifyToastKind">{KINDS[item.type] || "Notice"}</span>
              <p className="notifyToastMessage">{item.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
