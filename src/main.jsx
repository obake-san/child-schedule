import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// XMLHttpRequest インターセプター: Firebase 認証エラーをサイレント処理
const originalOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._url = url
  return originalOpen.apply(this, [method, url, ...args])
}

const originalSend = XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function(...args) {
  const originalOnError = this.onerror
  const self = this
  
  this.onerror = function(event) {
    // identitytoolkit エラーは無視
    if (self._url && self._url.includes('identitytoolkit')) {
      return false
    }
    if (originalOnError) {
      return originalOnError.call(this, event)
    }
  }
  
  const originalOnload = this.onload
  this.onload = function(event) {
    // identitytoolkit 400 エラーは無視
    if (self._url && self._url.includes('identitytoolkit') && this.status >= 400) {
      return false
    }
    if (originalOnload) {
      return originalOnload.call(this, event)
    }
  }
  
  return originalSend.apply(this, args)
}

// React DevToolsの開発メッセージを非表示にする
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isCommitting: false,
    onCommitFiberRoot: () => {}
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
