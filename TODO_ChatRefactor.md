# Chat Components Refactor TODO

## Tasks
- [x] Update ChatWindow.jsx: Remove API logic, change to 'role', add sources to AI messages, implement auto-scroll, pass onResponseReceived to ChatInput
- [x] Update ChatInput.jsx: Move API call here, call onResponseReceived after response or error
- [x] Update Message.jsx: Change to 'role', render SourceBox for AI messages
- [ ] Test the chat flow: user messages instant, AI after response, sources on AI, handle "Information not available"
