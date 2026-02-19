# 🏟️ HuddleUp — Pull Request

## 📋 Description
<!-- Provide a brief summary of your changes -->


## 🔗 Related Issue
<!-- Link the issue this PR addresses (e.g., "Fixes #123" or "Closes #123") -->
Fixes #

## 📝 Type of Change
<!-- Mark the appropriate option with an "x" (e.g., [x]) -->

- [ ] ✨ **New Feature** - Adding new functionality (e.g., video reactions, friend system, notifications)
- [ ] 🐛 **Bug Fix** - Non-breaking fix for an issue
- [ ] 🔧 **Enhancement** - Improvement to existing functionality
- [ ] 🎨 **UI/UX** - Styling, layout, or responsiveness improvements
- [ ] 📚 **Documentation** - Updates to README, CONTRIBUTING, or inline docs
- [ ] ♻️ **Refactor** - Code restructuring without changing behavior
- [ ] 🔒 **Security** - Auth, JWT, or data protection improvements

## 🏗️ Area of Change
<!-- Mark all that apply -->

- [ ] `client/` — React frontend (components, pages, hooks, context)
- [ ] `server/` — Express backend (controllers, routes, middleware, models)
- [ ] Both frontend and backend
- [ ] Config / CI / Docs only

## 📸 Screenshots
<!-- MANDATORY for UI changes. Add screenshots showing your changes -->
<!-- For bug fixes: Show before/after -->
<!-- For API changes: Include request/response examples -->

| Before | After |
|--------|-------|
| (screenshot) | (screenshot) |

## ✅ Checklist

### For All PRs
- [ ] I have read the [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
- [ ] I have tested my changes locally (both client and server if applicable)
- [ ] My code follows the existing project structure and coding style
- [ ] I have NOT modified any files unrelated to my change
- [ ] No console errors or warnings introduced

### For Frontend Changes (`client/`)
- [ ] Tested UI is responsive on mobile and desktop
- [ ] Used Tailwind CSS / ShadCN UI consistent with existing components
- [ ] React components are modular and reusable
- [ ] API calls use the existing `api.js` Axios instance
- [ ] Screenshots included for all visual changes

### For Backend Changes (`server/`)
- [ ] API endpoints follow RESTful conventions
- [ ] Auth middleware is applied where needed
- [ ] Mongoose models/schema changes are backward-compatible
- [ ] Error handling is implemented for new routes/controllers
- [ ] Environment variables (if new) are documented

### For Bug Fixes / Enhancements
- [ ] My changes ONLY address the specific issue mentioned
- [ ] I have NOT added any "bonus" features or unrelated changes
- [ ] I properly tested the fix/enhancement

---

## ⚠️ IMPORTANT RULES

> **🚨 PRs will be CLOSED WITHOUT REVIEW if they:**
>
> 1. ❌ Modify files **unrelated** to the issue being solved
> 2. ❌ Add "bonus" features or changes not requested
> 3. ❌ Include AI-generated code that hasn't been reviewed and tested
> 4. ❌ Don't include screenshots for UI changes
> 5. ❌ Have merge conflicts with the `main` branch
> 6. ❌ Break existing functionality (auth, video upload, comments, etc.)
>
> **Please respect maintainer time. Stick to ONLY what the issue asks for.**

---

## 🧪 Testing
<!-- Describe how you tested your changes -->

- [ ] Tested frontend on Chrome
- [ ] Tested frontend on Firefox
- [ ] Tested on Mobile (responsive)
- [ ] Backend API tested (Postman / Thunder Client / curl)
- [ ] Auth flows work correctly (login, register, protected routes)
- [ ] No console errors or server crashes

## 📝 Additional Notes
<!-- Any additional information or context -->
