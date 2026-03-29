// vision-gesture/events.js

export function emitCommand(action) { //importable in recognition.js
    document.dispatchEvent(
        new CustomEvent('gesture-command', {detail: { action } })
    )
}
