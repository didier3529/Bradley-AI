# Product Requirements Document (PRD)
## Remove Wallet Connection Landing Screen

**Document Version:** 1.0  
**Date:** January 2025  
**Priority:** High  
**Status:** Ready for Implementation

---

## Executive Summary

Remove the existing wallet connection landing screen and redirect all users directly to the main dashboard interface. This change eliminates the wallet connection requirement and streamlines user onboarding by providing immediate access to the platform's analytics features.

---

## Objective

**Primary Goal:** Eliminate the "Connect Wallet" entry screen and route users directly to the dashboard view upon application load.

**Business Rationale:** 
- Simplify user onboarding flow
- Remove barrier to platform exploration
- Enable immediate access to analytics features
- Reduce user friction and abandonment

---

## Scope

### In Scope
1. **Remove Landing Page Components**
   - Delete or disable the wallet connection landing page
   - Remove all wallet connection UI elements and prompts
   - Eliminate wallet connection call-to-action buttons

2. **Update Routing Logic**
   - Configure root path (`/`) to render dashboard directly
   - Remove route guards dependent on wallet connection status
   - Bypass any wallet connection validation flows

3. **Refactor Wallet Dependencies**
   - Replace wallet-dependent logic with mock/placeholder data
   - Ensure dashboard components function without connected wallet
   - Maintain portfolio display with sample data when no wallet is connected

### Out of Scope
- Backend wallet integration infrastructure (maintain for future use)
- Wallet connection functionality in other parts of the app
- Authentication flows unrelated to wallet connection
- Core dashboard functionality and features

---

## Technical Requirements

### Routing Changes
- **Root Route (`/`)**: Must render dashboard directly
- **Dashboard Route (`/dashboard`)**: Ensure compatibility with direct access
- **Route Guards**: Remove or modify any guards blocking dashboard access without wallet

### Component Modifications
1. **Landing Page**: Remove or disable completely
2. **Wallet Connection Components**: Remove from critical user flow
3. **Dashboard Components**: Ensure graceful handling of missing wallet data
4. **Navigation**: Update any references to landing/connection flows

### Data Handling
- Implement placeholder/mock data for portfolio displays when no wallet connected
- Ensure all dashboard widgets function with empty or sample data
- Maintain error boundaries for components that previously required wallet data

### State Management
- Remove wallet connection state requirements from critical application flows
- Update global state management to handle "no wallet" scenarios
- Ensure WebSocket connections and real-time features work without wallet dependency

---

## Acceptance Criteria

### Functional Requirements
- [ ] Application launches directly into dashboard view (no landing screen)
- [ ] Root URL (`/`) displays dashboard interface immediately
- [ ] No wallet connection prompts are visible to users
- [ ] Dashboard displays sample/placeholder data when no wallet is connected
- [ ] All navigation elements function correctly
- [ ] Real-time market data displays properly
- [ ] Portfolio section shows appropriate placeholder content

### Technical Requirements
- [ ] No console errors related to missing wallet connection
- [ ] No broken routes or navigation issues
- [ ] No hanging loading states waiting for wallet connection
- [ ] WebSocket connections establish successfully
- [ ] Application performance remains stable
- [ ] All existing functionality not dependent on wallet remains operational

### User Experience Requirements
- [ ] Smooth, immediate dashboard load experience
- [ ] Clear indication when features require wallet connection (if any)
- [ ] Consistent UI behavior across all dashboard sections
- [ ] Responsive design maintained across all screen sizes

---

## Technical Implementation Notes

### Key Areas to Investigate
1. **Route Configuration** (`src/app/` directory)
   - Check for landing page route definitions
   - Identify any route guards or middleware

2. **Wallet Integration** (`src/lib/hooks/` or similar)
   - Locate `useWallet` or similar hooks
   - Identify wallet connection state management

3. **Dashboard Components** (`src/components/dashboard/`)
   - Verify dashboard renders without wallet dependency
   - Ensure proper fallback data handling

4. **Provider Context** (`src/lib/providers/`)
   - Review wallet provider implementations
   - Check for connection requirements in context providers

### Potential Challenges
- Dashboard components may have hard dependencies on wallet connection
- Route guards might prevent dashboard access without wallet
- State management might be tightly coupled to wallet connection status
- Real-time features might require wallet address for personalization

---

## Success Metrics

### Immediate Metrics
- Application load time to dashboard
- Reduced user drop-off at entry point
- Elimination of wallet connection errors
- Successful dashboard rendering rate

### User Experience Metrics
- Time to first meaningful interaction
- User engagement with dashboard features
- Reduction in support requests related to wallet connection

---

## Risk Assessment

### Low Risk
- Removing unused landing page components
- Updating simple routing configuration
- Adding placeholder data for display components

### Medium Risk
- Modifying dashboard components with wallet dependencies
- Updating state management patterns
- Ensuring real-time features work without wallet context

### High Risk
- Breaking existing user authentication flows
- Disrupting WebSocket or real-time data connections
- Creating inconsistent user experience across features

---

## Implementation Timeline

### Phase 1: Analysis & Planning (Day 1)
- [ ] Audit current codebase for wallet dependencies
- [ ] Identify all components requiring modification
- [ ] Plan data mocking strategy for wallet-dependent features

### Phase 2: Implementation (Day 1-2)
- [ ] Remove landing page route and components
- [ ] Update root route to render dashboard
- [ ] Implement placeholder data for portfolio components
- [ ] Remove wallet connection guards and validators

### Phase 3: Testing & Validation (Day 2)
- [ ] Verify all acceptance criteria
- [ ] Test across different browser environments
- [ ] Validate error handling and edge cases
- [ ] Ensure no regression in existing functionality

### Phase 4: Deployment (Day 2)
- [ ] Deploy to staging environment
- [ ] Conduct final testing
- [ ] Deploy to production
- [ ] Monitor for any issues

---

## Conclusion

This change will significantly improve user onboarding by removing unnecessary friction while maintaining the platform's core functionality. The implementation should be straightforward given the modular architecture of the Bradley AI platform, with the primary focus on routing changes and graceful handling of missing wallet data.

**Next Steps:** Begin implementation by examining the current routing structure and wallet integration points in the codebase. 