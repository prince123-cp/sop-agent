# Refactor Pages and Components Plan

## Steps to Complete

- [x] Update Dashboard.jsx: Add static summary cards (Total SOPs, Last Upload Date) and navigation buttons ("Ask SOP" to Chat, "Upload SOP" to Admin).
- [x] Update Chat.jsx: Lift chat state (messages, loading) to this component. Pass props to ChatWindow (messages, loading, onSendMessage, onResponseReceived, onError) and ChatInput (onSendMessage, loading, onResponseReceived, onError). Remove Navbar.
- [x] Update Admin.jsx: Change layout from grid to vertical (Upload on top, List below).
- [x] Update ChatWindow.jsx: Remove internal state management; receive messages, loading, and handlers as props.
- [x] Update ChatInput.jsx: Update to handle API calls using chat.api.js, and call onResponseReceived or onError accordingly.
