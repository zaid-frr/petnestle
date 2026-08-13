# PetNestle Security & Testing Checklist

Comprehensive security documentation and testing procedures for PetNestle deployment and maintenance.

---

## 🔐 Security Architecture Overview

### Security Layers

#### Layer 1: API Key Protection
- ✅ **Gemini API key stored on Vercel only** (not in browser)
- ✅ **Serverless function** (`/api/chat`) acts as secure proxy
- ✅ `.env` file in `.gitignore` (never committed)

#### Layer 2: Authentication
- ✅ **Firebase Authentication** with Email/Password and Google Sign-In
- ✅ **Session tokens** managed by Firebase (expires after 1 hour)
- ✅ **Password requirements** enforced on client-side (min 6 characters)

#### Layer 3: Database Security (Firestore)
- ✅ **Owner-based access control** - users can only access their own data
- ✅ **Admin override** - designated admins can access all data if needed
- ✅ **No hardcoded admin email** - admin status checked dynamically in Firestore
- ✅ **Read/Write/Delete rules** enforced per collection

#### Layer 4: Transport & Infrastructure
- ✅ **HTTPS Only** - enforced by Vercel
- ✅ **CORS enabled** on serverless function (only allows same-origin requests)
- ✅ **Security headers** configured (X-Content-Type-Options, X-Frame-Options, etc.)

---

## 🛡️ Security Checklist

### Before Deployment

- [ ] **API Keys**
  - [ ] No API keys committed to git (check `.gitignore`)
  - [ ] `GEMINI_API_KEY` prepared in secure location
  - [ ] Firebase config uses correct project ID
  - [ ] No test/staging keys in production config

- [ ] **Authentication**
  - [ ] Firebase Email/Password enabled
  - [ ] Firebase Google OAuth configured
  - [ ] OAuth consent screen filled out (if using new Google project)
  - [ ] Redirect URIs include Vercel domain

- [ ] **Firestore Rules**
  - [ ] `firestore.rules` deployed and verified
  - [ ] Rules tested locally (run `firebase emulators:start`)
  - [ ] No "allow if true" rules (would open database)
  - [ ] Owner-based access enforced for all collections

- [ ] **Environment Variables**
  - [ ] Vercel env vars set for all environments (Prod, Preview, Dev)
  - [ ] No secrets in code or config files
  - [ ] Environment variable names are correct and typo-free

### During Deployment

- [ ] **Vercel Setup**
  - [ ] Project connected to GitHub repo
  - [ ] Environment variables imported and verified
  - [ ] Automatic deployments from `master` branch enabled
  - [ ] Production domain configured

- [ ] **Firebase Setup**
  - [ ] Firestore security rules deployed
  - [ ] Authorized domains added (Vercel domain + localhost)
  - [ ] Authentication providers enabled
  - [ ] Backup and recovery options configured

- [ ] **SSL/TLS**
  - [ ] HTTPS enforced (no HTTP fallback)
  - [ ] SSL certificate valid and current
  - [ ] Certificate warning on browser (should show padlock)

### After Deployment

- [ ] **First Login Test**
  - [ ] Create test account via email/password
  - [ ] Verify account created in Firebase Auth
  - [ ] Test Google Sign-In
  - [ ] Verify session tokens working

- [ ] **Data Access Test**
  - [ ] Create test pet - verify only accessible to logged-in user
  - [ ] Try accessing another user's pet via URL manipulation (should fail)
  - [ ] Verify Firestore rules blocked unauthorized access

- [ ] **API Security Test**
  - [ ] Check API key NOT exposed in browser requests
  - [ ] Verify API key NOT visible in Network tab
  - [ ] Test API with invalid key (should return error)
  - [ ] Verify CORS prevents cross-origin requests

---

## 🧪 Functional Testing Checklist

### Test 1: Authentication Flows

#### 1.1 Email Registration Happy Path
- [ ] Go to Login page
- [ ] Click "Don't have an account?"
- [ ] Fill registration form:
  - [ ] Valid email (e.g., `test-user@example.com`)
  - [ ] Strong password (8+ chars, numbers, symbols)
  - [ ] Confirm password matches
- [ ] Click "Register"
- [ ] **Expected:** Redirects to Dashboard, shows user info
- [ ] **Verify:** User exists in Firebase Console → Authentication

#### 1.2 Email Registration Validation
- [ ] Try registering with:
  - [ ] Invalid email (no @): **Should show error**
  - [ ] Weak password (<6 chars): **Should show error**
  - [ ] Existing email: **Should show "already registered"**
  - [ ] Mismatched passwords: **Should show error**

#### 1.3 Email Login Happy Path
- [ ] Go to Login page
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Login"
- [ ] **Expected:** Redirects to Dashboard

#### 1.4 Email Login Failure Cases
- [ ] Try login with:
  - [ ] Wrong password: **Should show error**
  - [ ] Non-existent email: **Should show error**
  - [ ] Empty fields: **Should show error**

#### 1.5 Google Sign-In
- [ ] Go to Login page
- [ ] Click "Sign in with Google"
- [ ] Complete Google authentication
- [ ] **Expected:** Redirects to Dashboard, auto-fills name/email
- [ ] **Verify:** Google account linked in Firebase Console

#### 1.6 Session Management
- [ ] Login to account
- [ ] Close browser tab
- [ ] Reopen app
- [ ] **Expected:** Still logged in (session persists)
- [ ] Hard refresh (Ctrl+F5)
- [ ] **Expected:** Still logged in

#### 1.7 Logout
- [ ] While logged in, click "Logout"
- [ ] **Expected:** Redirects to Home page, user is logged out
- [ ] Try accessing Dashboard directly
- [ ] **Expected:** Redirects to Login page

---

### Test 2: Database Access Control

#### 2.1 Create Pet (Owner Access)
- [ ] Login as User A
- [ ] Go to Dashboard → Add Pet
- [ ] Create pet:
  - [ ] Name: `Buddy`
  - [ ] Type: `Dog`
  - [ ] Age: `3 years`
- [ ] **Expected:** Pet saved and visible in dashboard

#### 2.2 User Isolation (Own Data Only)
- [ ] Login as User A, note pet ID from browser DevTools → Application → IndexedDB
- [ ] Logout, login as User B
- [ ] **Expected:** User B's pet list is EMPTY
- [ ] Try accessing User A's pet directly via URL manipulation (if applicable)
- [ ] **Expected:** Permission denied or 404

#### 2.3 Firestore Rules Enforcement
- [ ] Use Firebase CLI to check Firestore access:
  ```bash
  firebase emulators:start
  ```
- [ ] Try querying pets collection with different user contexts
- [ ] **Expected:** Only return user's own pets

#### 2.4 Booking Data Access
- [ ] Login as User A
- [ ] Create a booking
- [ ] Note booking ID
- [ ] Logout, login as different user
- [ ] Try accessing that booking
- [ ] **Expected:** Access denied (not visible in list or direct access)

#### 2.5 Provider Access to Bookings
- [ ] (Future test) When provider accounts exist:
  - [ ] Login as provider
  - [ ] **Expected:** Can see bookings assigned to them
  - [ ] Should NOT see other provider's bookings

---

### Test 3: Chatbot & AI Integration

#### 3.1 Basic Chat Functionality
- [ ] Login to account
- [ ] Go to Chatbot page
- [ ] Send message: "What should a dog eat?"
- [ ] **Expected:**
  - [ ] Message appears in chat
  - [ ] Loading indicator shows
  - [ ] Response arrives within 3 seconds
  - [ ] Response is relevant and formatted

#### 3.2 API Key Security
- [ ] Open browser DevTools → Network tab
- [ ] Send chat message
- [ ] Check `/api/chat` request:
  - [ ] **Request body:** Should NOT contain `GEMINI_API_KEY`
  - [ ] **Response:** Should only contain chat response text
  - [ ] **Headers:** No sensitive data visible

#### 3.3 Multi-Chat Support
- [ ] Create first chat and send message
- [ ] Click "+" to create new chat
- [ ] Send different question
- [ ] Switch between chats
- [ ] **Expected:** Each chat maintains its own history
- [ ] Rename a chat: hover → click pencil → edit name → press Enter
- [ ] **Expected:** Name updates in sidebar

#### 3.4 Chat Persistence
- [ ] Create 3 different chats with different messages
- [ ] Refresh page (F5)
- [ ] **Expected:** All chats still visible, history intact
- [ ] Open DevTools → Application → Local Storage
- [ ] **Expected:** Should see chat data stored as JSON
- [ ] Delete Local Storage, refresh
- [ ] **Expected:** Chats gone (this is intentional for privacy)

#### 3.5 Error Handling
- [ ] Simulate offline: DevTools → Network tab → set "Offline"
- [ ] Try sending message
- [ ] **Expected:** Shows user-friendly error message (not raw error)
- [ ] Go back online, try again
- [ ] **Expected:** Message sends successfully

---

### Test 4: Form Input & Validation

#### 4.1 Pet Registration Form
- [ ] Test blank submission:
  - [ ] Leave all fields empty, click Save
  - [ ] **Expected:** Shows "This field is required" for each
- [ ] Test invalid data:
  - [ ] Age field: enter "abc"
  - [ ] **Expected:** Shows "Must be a number"
  - [ ] Breed field: leave blank (if required)
  - [ ] **Expected:** Shows required message

#### 4.2 Booking Form
- [ ] Start booking flow
- [ ] Try submitting without selecting date
- [ ] **Expected:** Shows error
- [ ] Select past date
- [ ] **Expected:** Shows "Date must be in future" (if enforced)
- [ ] Select valid future date
- [ ] Click Book
- [ ] **Expected:** Booking created

#### 4.3 XSS Prevention (Input Sanitization)
- [ ] In any form field, try entering HTML:
  ```
  <script>alert('xss')</script>
  ```
- [ ] Submit form
- [ ] **Expected:** 
  - [ ] No alert appears (script not executed)
  - [ ] Text saved as-is (or sanitized)
  - [ ] No errors in console

---

### Test 5: Notifications

#### 5.1 Create Notification
- [ ] Book a service
- [ ] **Expected:** Notification generated (check Firestore → notifications collection)

#### 5.2 Notification Display
- [ ] Go to Dashboard
- [ ] Click notification bell icon
- [ ] **Expected:** Shows unread notifications

#### 5.3 Notification Mark as Read
- [ ] Click on notification
- [ ] **Expected:** Notification marked as read
- [ ] Verify in Firestore that notification has `read: true`

---

### Test 6: Performance Testing

#### 6.1 Page Load Time
- [ ] Open DevTools → Network tab
- [ ] Set "Slow 3G" throttling
- [ ] Reload page
- [ ] Measure load time
- [ ] **Expected:** < 5 seconds (acceptable for slow network)

#### 6.2 Interactive Time
- [ ] Measure Time to Interactive (TTI)
- [ ] **Expected:** < 3 seconds on normal connection

#### 6.3 Lighthouse Score
- [ ] DevTools → Lighthouse (or use web.dev)
- [ ] Run audit (Performance, Accessibility, Best Practices, SEO)
- [ ] **Expected Scores:**
  - [ ] Performance: 80+
  - [ ] Accessibility: 90+
  - [ ] Best Practices: 85+
  - [ ] SEO: 90+

#### 6.4 Large Chat History
- [ ] Send 50+ messages in a chat
- [ ] Scroll through history
- [ ] **Expected:** Smooth scrolling, no lag
- [ ] Performance should remain acceptable

---

### Test 7: Mobile Responsiveness

#### 7.1 Mobile Layout (375px viewport)
- [ ] DevTools → Responsive Design Mode (Ctrl+Shift+M)
- [ ] Set to iPhone SE (375x667)
- [ ] Test each page:
  - [ ] Home: Centered, readable
  - [ ] Services: Single-column list
  - [ ] Chatbot: Input at bottom, messages above
  - [ ] Dashboard: Stacked layout
- [ ] **Expected:** All text readable, buttons clickable

#### 7.2 Tablet Layout (768px)
- [ ] Set to iPad (768x1024)
- [ ] Test layout adapts (2-column or full-width)
- [ ] **Expected:** Best use of space

#### 7.3 Touch Interactions
- [ ] On mobile device or touch screen:
  - [ ] Tap buttons
  - [ ] Type in input fields
  - [ ] Scroll chat history
  - [ ] Swipe (if applicable)
- [ ] **Expected:** All work smoothly

#### 7.4 Accessibility on Mobile
- [ ] Enable screen reader (VoiceOver on iOS, TalkBack on Android)
- [ ] Navigate app
- [ ] **Expected:** All elements readable by screen reader

---

### Test 8: Browser Compatibility

#### 8.1 Chrome/Edge (Chromium)
- [ ] Latest version
- [ ] Test all features
- [ ] **Expected:** 100% working

#### 8.2 Firefox
- [ ] Latest version
- [ ] Test all features
- [ ] Check for console errors
- [ ] **Expected:** 100% working

#### 8.3 Safari (if available)
- [ ] Latest version
- [ ] Special attention to:
  - [ ] LocalStorage
  - [ ] Service Workers
  - [ ] CSS grid/flexbox
- [ ] **Expected:** 100% working

#### 8.4 Mobile Browsers
- [ ] iOS Safari: Test UI, dialogs, keyboard
- [ ] Chrome Mobile: Test performance, scrolling
- [ ] Firefox Mobile: Test stability

---

## 🔒 Security Audit Checklist

### Code Security

- [ ] **No Hardcoded Secrets**
  - [ ] Grep for API keys in codebase
  - [ ] Grep for passwords in code
  - [ ] Grep for tokens in code
  ```bash
  grep -r "GEMINI_API_KEY" src/
  # Should only appear in environment config, not hardcoded
  ```

- [ ] **No Console.log Sensitive Data**
  - [ ] Search for `console.log` with variables
  - [ ] Remove any logging of auth tokens, user data, emails
  ```bash
  grep -r "console.log" src/ | grep -i "auth\|token\|key\|password"
  ```

- [ ] **Dependencies Security**
  - [ ] Run `npm audit`
  - [ ] Address critical vulnerabilities
  - [ ] Keep dependencies updated
  ```bash
  npm audit
  npm audit fix  # Auto-fix if safe
  ```

- [ ] **No SQL Injection Risk**
  - [ ] Using Firestore (not SQL), but validate all user inputs
  - [ ] Ensure query filters don't allow manipulation

### Firestore Rules Security

- [ ] **Test Rules Locally**
  ```bash
  firebase emulators:start
  # Test all read/write scenarios
  ```

- [ ] **Validate Rules Logic**
  - [ ] `isAuthenticated()` - checks user is logged in ✅
  - [ ] `isOwner()` - user can only access own data ✅
  - [ ] `isAdmin()` - admin bypasses some rules (if applicable)
  - [ ] No `allow if true` anywhere
  - [ ] Default `deny` for collections not explicitly allowed

- [ ] **Test Edge Cases**
  - [ ] Unauthenticated user tries to read
  - [ ] User A tries to read User B's pet
  - [ ] User tries to modify booking they didn't create
  - [ ] Admin tries to access anything (should succeed)

### API Security

- [ ] **Vercel Function Validation**
  - [ ] Environment variables are set
  - [ ] Function doesn't leak API key in error messages
  - [ ] Error responses are generic (don't expose internals)
  - [ ] CORS properly configured

- [ ] **Request Validation**
  - [ ] Validate request body isn't malicious
  - [ ] Check request headers
  - [ ] Implement rate limiting (future enhancement)

### Authentication Security

- [ ] **Firebase Auth Configuration**
  - [ ] Email password strength enforced
  - [ ] Session tokens expire properly
  - [ ] No persistent tokens in localStorage (Firebase handles)
  - [ ] CORS headers prevent unauthorized origins

- [ ] **Google OAuth**
  - [ ] Consent screen is properly configured
  - [ ] Redirect URIs are exactly correct
  - [ ] No implicit grant (using Authorization Code Flow)

### Network Security

- [ ] **HTTPS Only**
  - [ ] Verify `https://` in address bar
  - [ ] Check certificate is valid
  - [ ] Try accessing `http://` version (should redirect)

- [ ] **Security Headers**
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] Content-Security-Policy present
  - [ ] Strict-Transport-Security enabled
  ```bash
  curl -i https://your-domain.vercel.app | grep -i "x-"
  ```

- [ ] **CORS Configuration**
  - [ ] Only allow requests from your domain
  - [ ] Don't allow `*` origin in production
  - [ ] Check `/api/chat` endpoint is restricted

---

## 🚨 Security Issues & How to Fix

### Critical Issues (Fix Immediately)

| Issue | Impact | Fix |
|-------|--------|-----|
| **API key exposed in code** | Anyone with access can call API and incur charges | Move to Vercel env vars, never commit |
| **Firestore rules: `allow if true`** | Anyone (even anonymous) can read/write all data | Rewrite rules with owner-based access |
| **Missing HTTPS** | Data transmitted in plain text | Vercel enforces HTTPS automatically |
| **Admin email hardcoded** | Current admin can't be changed, can't revoke access | Check Firestore `users` collection for role |

### High Priority Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| **User data not isolated** | User A can access User B's data | Enforce `request.auth.uid` in all rules |
| **Weak password requirements** | Easy to brute force accounts | Enforce min 8 chars, numbers, symbols |
| **No rate limiting** | API abuse, DOS attacks possible | Add rate limiting to serverless function |
| **API key in browser logs** | Sensitive data leaked to console | Remove console.log of tokens/keys |

### Medium Priority Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| **Missing security headers** | Clickjacking, XSS attacks | Add headers in Vercel config |
| **No audit logging** | Can't track who did what | Add activity logs to Firestore |
| **Unencrypted sensitive data** | Privacy concern | Add encryption for PII if storing |
| **No backup strategy** | Data loss possible | Enable Firestore automated backups |

---

## 📋 Testing Report Template

Use this template to document test results:

```markdown
# PetNestle Security & Testing Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** Production / Staging

## Summary
- [ ] All critical tests passed
- [ ] All high priority tests passed
- [ ] All medium priority tests passed

## Test Results

### Authentication (5/5 passed)
- [x] Email registration
- [x] Email login
- [x] Google Sign-In
- [x] Session persistence
- [x] Logout

### Database (4/4 passed)
- [x] User data isolation
- [x] Pet CRUD operations
- [x] Booking access control
- [x] Firestore rules enforced

### API Security (3/3 passed)
- [x] API key not exposed
- [x] Responses don't leak secrets
- [x] CORS prevents unauthorized origin

### Performance (4/4 passed)
- [x] Page load < 2 seconds
- [x] Chatbot response < 3 seconds
- [x] Lighthouse score 80+
- [x] Smooth performance with 50+ chats

### Mobile (4/4 passed)
- [x] iOS Safari responsive
- [x] Android Chrome responsive
- [x] Touch interactions work
- [x] Accessibility works

## Issues Found

### Critical
- None

### High
- None

### Medium
- (List any issues)

## Recommendations
- (List any improvements)

## Sign-Off
- [x] Ready for production
- [x] All blockers resolved
- [x] Documentation complete

Approved by: _______________  Date: _______
```

---

## 🔄 Ongoing Security Maintenance

### Weekly
- [ ] Check Firebase Console for unusual activity
- [ ] Review Vercel logs for errors
- [ ] Check npm packages for security updates

### Monthly
- [ ] Run `npm audit` and address vulnerabilities
- [ ] Review Firestore rules for edge cases
- [ ] Test backup/restore process
- [ ] Check HTTPS certificate expiration

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing (if budget allows)
- [ ] Review third-party integrations
- [ ] Update security documentation

### Annually
- [ ] Full compliance review (GDPR, CCPA, etc.)
- [ ] Security training for team
- [ ] Update incident response plan
- [ ] Review and update all security policies

---

## 📞 Security Incident Response

### If Breach Suspected
1. **Immediate:** Take site offline if necessary
2. **Investigation:** Check logs, identify scope
3. **Notification:** Inform affected users within 24 hours
4. **Remediation:** Fix vulnerability, redeploy
5. **Communication:** Publish security advisory
6. **Follow-up:** Review and improve defenses

### Contacts
- **Vercel Support:** support@vercel.com
- **Firebase Support:** https://firebase.google.com/support
- **Google Security:** security@google.com

---

**Testing Completed:** _______________  
**Status:** ✅ Production Ready / ⚠️ Needs Fixes  
**Next Review Date:** _______________  

