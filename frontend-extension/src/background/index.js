let currentContext = 'feed' // 'feed' | 'composing'
let activeTabId = null

// ── Side panel ───────────────────────────────────────────────────────────────

chrome.action.onClicked.addListener((tab) => {
  activeTabId = tab.id
  chrome.sidePanel.open({ tabId: tab.id })
})

// ── Message router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id ?? activeTabId

  switch (message.type) {
    case 'CONTEXT':
      currentContext = message.context
      forwardToSidePanel({ type: 'CONTEXT_UPDATE', context: message.context })
      break

    case 'GESTURE':
      forwardToSidePanel({ type: 'GESTURE_UPDATE', action: message.action, context: currentContext })
      handleGesture(message.action, tabId)
      break

    case 'TTS':
      // TODO task 5: call Person 2's TTS endpoint with message.text
      console.log('[AshnCo SW] TTS requested:', message.text)
      break
  }
})

// ── Gesture routing ──────────────────────────────────────────────────────────

function handleGesture(action, tabId) {
  switch (action) {
    case 'like':
      // Context-dependent: like when browsing, post draft when composing
      if (currentContext === 'composing') {
        sendToContent(tabId, { type: 'POST_DRAFT' })
      } else {
        sendToContent(tabId, { type: 'LIKE_POST' })
      }
      break

    case 'post':
      // Open compose and start voice input
      sendToContent(tabId, { type: 'OPEN_COMPOSE' })
      // TODO task 5: trigger STT, then send FILL_COMPOSE back to content script
      break

    case 'next':
      sendToContent(tabId, { type: 'NEXT_POST' })
      break

    case 'readAloud':
      // Context-dependent: read post when browsing, read draft when composing
      sendToContent(tabId, { type: 'READ_ALOUD' })
      break
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendToContent(tabId, message) {
  if (!tabId) return
  chrome.tabs.sendMessage(tabId, message)
}

function forwardToSidePanel(message) {
  // Broadcast to all extension pages (side panel listens for these)
  chrome.runtime.sendMessage(message).catch(() => {
    // Side panel may not be open — ignore
  })
}
