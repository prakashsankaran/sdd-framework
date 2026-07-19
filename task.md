# Task Checklist: Spec Kit & Floating RAG Chatbot Integration

- [x] **Phase 1: Backend RAG pipeline**
  - [x] Implement `answerQuery` service inside `vectorDb.service.js` using `gemini-3.1-flash-lite`
  - [x] Add `POST /api/chat` route to `index.queue.js`
  - [x] Write a verification script `test-chat.js` to verify RAG answers are generated correctly
- [x] **Phase 2: Frontend Chatbot Widget**
  - [x] Create `ChatbotWidget.jsx` component in `framework/src/components/`
  - [x] Integrate chatbot global styles and loading typography indicators
- [x] **Phase 3: Sidebar Cleanup & Layout Integration**
  - [x] Remove `/repo` link from sidebar in `main.jsx`
  - [x] Mount `<ChatbotWidget />` in `main.jsx` global `<Layout>`
- [x] **Phase 4: Spec Kit Scaffolder (Requirement Agent)**
  - [x] Create Spec Kit document generator service (`specKit.service.js`) enqueuing Gemini prompts
  - [x] Create backend API endpoints `/api/specs/list`, `/api/specs/active`, and `/api/specs/generate`
  - [x] Build frontend `RequirementAgent.jsx` page for paste/upload spec inputs
  - [x] Add dropdown spec select list to global top bar header for dynamic switching
  - [x] Verify spec generation and files output correctly inside `specs/00X-feature/` folders
