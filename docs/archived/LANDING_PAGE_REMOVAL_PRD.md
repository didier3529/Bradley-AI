# Product Requirements Document: Landing Page Removal

## Executive Summary

**Objective:** Remove the landing page from the Bradley AI application and make the dashboard the default entry point while maintaining robust authentication flows and user experience.

**Background:** The current application loads a landing page at `/` with marketing content and wallet connection flow. To streamline the user experience, we need to eliminate this step and have authenticated users go directly to the dashboard, while unauthenticated users are redirected to appropriate authentication mechanisms.

---

## Scope & Requirements

### In Scope
- Remove landing page component and all related assets
- Modify root route (`/`) to redirect appropriately based on authentication state
- Ensure dashboard becomes the primary entry point for authenticated users
- Maintain existing authentication and security flows
- Preserve all navigation, routing, and state management functionality

### Out of Scope
- Modifications to authentication providers or login mechanisms
- Changes to dashboard functionality or layout
- Modifications to other pages (market, portfolio, NFT, etc.)
- Updates to external API integrations

---

## Current Architecture Analysis

### Landing Page Components to Remove
```
src/components/landing/
├── landing-page.tsx           # Main landing component
├── navbar.tsx                 # Landing navbar
├── hero-section.tsx           # Hero with wallet connection
├── features-section.tsx       # Feature showcase
├── multi-chain-section.tsx    # Multi-chain support info
├── call-to-action.tsx         # CTA components
├── feature-showcase.tsx       # Additional features
└── how-it-works-section.tsx   # Process explanation
```

### Current Route Structure
- `/` → `LandingPage` component
- `/dashboard` → `DashboardPage` component (protected)
- Middleware redirects protected routes to `/` if unauthenticated

### Authentication Flow
- Users connect wallet via landing page
- Authentication provider manages state
- Dashboard redirects to `/` if not authenticated
- Middleware protects routes and redirects to `/`

---

## Technical Implementation Plan

### Phase 1: Route Modification
1. **Update root page (`src/app/page.tsx`)**
   - Remove `LandingPage` import and usage
   - Implement authentication-based redirect logic
   - Add loading states for authentication checks

2. **Update middleware (`src/middleware.ts`)**
   - Modify protected paths logic if needed
   - Ensure proper redirect flows work with new root route

### Phase 2: Component Cleanup
1. **Remove landing components**
   - Delete entire `src/components/landing/` directory
   - Remove related imports and references

2. **Update authentication flows**
   - Ensure wallet connection works without landing page
   - Verify redirect flows function properly

### Phase 3: Navigation Updates
1. **Update any navigation references**
   - Check for hardcoded links to landing page
   - Update authentication redirect targets

2. **Clean up unused assets**
   - Remove landing page specific images/icons if any
   - Clean up unused CSS/styles

---

## Proposed Solution

### New Root Route Behavior
```typescript
// src/app/page.tsx (new implementation)
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/providers/auth-provider"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      } else {
        // Could redirect to a simple login page or show wallet connection
        // For now, show basic wallet connection UI
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  // Show minimal wallet connection UI for unauthenticated users
  return <WalletConnectionPage />
}
```

### Authentication Redirect Flow
1. **Authenticated users:** `/` → immediately redirect to `/dashboard`
2. **Unauthenticated users:** `/` → show minimal wallet connection interface
3. **Protected routes:** Still redirect to `/` if not authenticated (handled by middleware)

---

## Implementation Tasks

### High Priority
- [ ] **TASK-001:** Update root page route logic
- [ ] **TASK-002:** Create minimal wallet connection component 
- [ ] **TASK-003:** Remove landing page components
- [ ] **TASK-004:** Test authentication flows

### Medium Priority  
- [ ] **TASK-005:** Update any hardcoded navigation references
- [ ] **TASK-006:** Clean up unused imports and assets
- [ ] **TASK-007:** Update middleware if necessary

### Low Priority
- [ ] **TASK-008:** Update documentation
- [ ] **TASK-009:** Performance testing
- [ ] **TASK-010:** SEO considerations for root route

---

## Risk Assessment & Mitigation

### High Risk
- **Authentication flow disruption**
  - *Mitigation:* Thoroughly test all auth flows before/after changes
  - *Rollback:* Keep landing page components until testing complete

### Medium Risk  
- **Broken navigation links**
  - *Mitigation:* Search codebase for hardcoded references to landing page
  - *Testing:* Comprehensive link testing across all pages

### Low Risk
- **SEO impact from landing page removal**
  - *Mitigation:* Consider adding proper meta tags to dashboard
  - *Monitoring:* Track user acquisition metrics post-deployment

---

## Testing Strategy

### Unit Tests
- Test new root route component behavior
- Test authentication redirect logic
- Test loading states and error handling

### Integration Tests  
- Test complete authentication flow from root to dashboard
- Test unauthenticated user experience
- Test navigation from other pages to root

### Manual Testing
- [ ] Load `/` as authenticated user → should go to dashboard
- [ ] Load `/` as unauthenticated user → should show wallet connection
- [ ] Test wallet connection from new root page
- [ ] Test navigation from dashboard back to root
- [ ] Test direct access to protected routes
- [ ] Test logout flow and return to root

---

## Acceptance Criteria

### Primary Criteria
- [ ] User visits `/` and is taken directly to dashboard if authenticated
- [ ] Unauthenticated user sees wallet connection interface at `/`
- [ ] All authentication flows work without landing page
- [ ] No 404 errors or broken links introduced
- [ ] No console errors or runtime issues

### Secondary Criteria
- [ ] Application performance is maintained or improved
- [ ] All existing functionality works as before
- [ ] Clean removal of unused code and assets
- [ ] Proper loading states during authentication checks

---

## Rollback Plan

If issues arise during implementation:

1. **Immediate rollback:** Revert `src/app/page.tsx` to original landing page implementation
2. **Partial rollback:** Restore landing page components while keeping route changes
3. **Full rollback:** Restore entire landing page structure and update routing

### Rollback Triggers
- Authentication flow breaks
- User unable to access dashboard
- Performance degradation > 20%
- Critical bugs affecting core functionality

---

## Success Metrics

### Technical Metrics
- Zero authentication-related errors post-deployment
- Page load time for authenticated users ≤ current dashboard load time
- No increase in error rates or failed authentication attempts

### User Experience Metrics
- Reduced time-to-dashboard for authenticated users
- Maintained or improved user satisfaction scores
- No increase in user-reported navigation issues

---

## Timeline

**Estimated Development Time:** 1-2 days

- **Day 1:** Implementation and unit testing
- **Day 2:** Integration testing and deployment

**Phases:**
1. **Development:** 4-6 hours
2. **Testing:** 2-4 hours  
3. **Review & Deploy:** 1-2 hours

---

## Dependencies

### Internal Dependencies
- No changes to authentication provider
- No changes to dashboard implementation
- No changes to middleware authentication logic

### External Dependencies
- None identified

---

## Future Considerations

After successful landing page removal:

1. **Enhanced onboarding:** Consider adding guided dashboard tour for new users
2. **Marketing presence:** Evaluate need for separate marketing/landing site
3. **User acquisition:** Monitor impact on new user acquisition and adjust strategy
4. **Authentication options:** Consider adding more authentication methods at root route

---

**Document Version:** 1.0  
**Created:** January 2025  
**Author:** Development Team  
**Status:** Ready for Implementation 