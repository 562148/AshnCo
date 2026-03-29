const gestureLabel = document.getElementById('gesture-label')
const contextBadge = document.getElementById('context-badge')

let resetTimer = null

// Returns emoji + description based on gesture and current context
function getGestureLabel(action, context) {
  switch (action) {
    case 'like':
      return context === 'composing' ? '👍 Post draft' : '👍 Like post'
    case 'post':
      return '✌️ Create post + voice'
    case 'next':
      return '🤙 Next post'
    case 'readAloud':
      return context === 'composing' ? '🖐 Read draft aloud' : '🖐 Read post aloud'
    default:
      return action
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'GESTURE_UPDATE') {
    gestureLabel.textContent = getGestureLabel(message.action, message.context)
    gestureLabel.className = 'active'

    // Reset back to idle after 2s
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      gestureLabel.textContent = 'No gesture detected'
      gestureLabel.className = 'no-gesture'
    }, 2000)
  }

  if (message.type === 'CONTEXT_UPDATE') {
    contextBadge.textContent = message.context === 'composing' ? 'Composing' : 'Feed'
    contextBadge.className   = `badge ${message.context}`
  }
})
