import React from "react"

export const BrandMark = ({ className = "" }) => (
  <svg className={className ? "brandMark " + className : "brandMark"} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#10182b" />
    <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="7.4" fill="none" stroke="rgba(142, 176, 255, 0.5)" />
    <path d="M8 22V16.5" stroke="#6d97ff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M13 22V13" stroke="#8eb0ff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M18 22V10" stroke="#c5d4ff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M23 22V8" stroke="#3ddec0" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M8 16.2L13 12.6L18 9.6L23 7.4" fill="none" stroke="#e8eefc" strokeWidth="1.15" />
    <circle cx="8" cy="16.2" r="1.45" fill="#6d97ff" />
    <circle cx="13" cy="12.6" r="1.45" fill="#8eb0ff" />
    <circle cx="18" cy="9.6" r="1.45" fill="#c5d4ff" />
    <circle cx="23" cy="7.4" r="1.45" fill="#3ddec0" />
  </svg>
)

export default BrandMark
