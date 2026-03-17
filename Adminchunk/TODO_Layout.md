# Layout Components Update Plan

## Steps to Complete:
- [x] Update Navbar.jsx: Add app branding ("SOP AI Assistant"), environment indicator ("Connected" static), user profile (dummy avatar "A", dropdown with Role: Admin, Logout UI only). Remove navigation links from Navbar.
- [x] Create Sidebar.jsx: Add navigation links (Dashboard /, Ask SOP /chat, Upload SOP /upload, SOP List /sop-list), active link highlighting using useLocation, role-based menu (hardcoded Admin - show all options).
- [x] Create Layout.jsx: Wrap pages with Sidebar and Navbar.
- [x] Update App.jsx: Use Layout with nested routes for Dashboard, Chat, Upload, SopList, Admin.
- [x] Update pages: Remove Navbar imports and adjust structure for layout.
- [x] Ensure no API calls or backend logic in components.
- [x] Test: Sidebar click changes route, active highlight works, Navbar consistent across pages.

## Progress Tracking:
- All steps completed.
