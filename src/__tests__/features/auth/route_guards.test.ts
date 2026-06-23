/**
 * route_guards.test.ts
 *
 * Ported from Flutter sign_out_test.dart — tests the pure redirect resolver
 * that drives route guard logic without any React or Firebase dependencies.
 *
 * The resolveRedirect function mirrors the router guard behaviour in the app:
 *   - While auth state is loading, gate everything to /auth (splash behaviour).
 *   - When not logged in, redirect any non-auth path to /auth.
 *   - When logged in, bounce /auth to /dashboard; all other paths are clear.
 */

// ---------------------------------------------------------------------------
// Pure redirect resolver (no React, no Firebase)
// ---------------------------------------------------------------------------

interface AuthState {
  isLoading: boolean
  isLoggedIn: boolean
  currentPath: string
}

/**
 * Returns the path to redirect to, or null if no redirect is needed.
 *
 * Path matching for /auth is prefix-based so that sub-routes like
 * /auth/register are treated as being "on the auth screen".
 */
export function resolveRedirect(state: AuthState): string | null {
  const onAuthScreen = state.currentPath === '/auth' || state.currentPath.startsWith('/auth/')

  if (state.isLoading) {
    return onAuthScreen ? null : '/auth'
  }

  if (!state.isLoggedIn) {
    return onAuthScreen ? null : '/auth'
  }

  // Logged in — send away from the auth screen.
  if (onAuthScreen) return '/dashboard'
  return null
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('unauthenticated redirects', () => {
  const base: AuthState = { isLoading: false, isLoggedIn: false, currentPath: '' }

  it('redirects /team to /auth when not logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/team' })).toBe('/auth')
  })

  it('redirects /dashboard to /auth when not logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/dashboard' })).toBe('/auth')
  })

  it('redirects /rating to /auth when not logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/rating' })).toBe('/auth')
  })

  it('returns null for /auth when not logged in — already on auth screen', () => {
    expect(resolveRedirect({ ...base, currentPath: '/auth' })).toBeNull()
  })

  it('returns null for /auth/register when not logged in — treated as auth screen', () => {
    expect(resolveRedirect({ ...base, currentPath: '/auth/register' })).toBeNull()
  })
})

describe('authenticated redirects', () => {
  const base: AuthState = { isLoading: false, isLoggedIn: true, currentPath: '' }

  it('redirects /auth to /dashboard when logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/auth' })).toBe('/dashboard')
  })

  it('returns null for /team when logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/team' })).toBeNull()
  })

  it('returns null for /dashboard when logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/dashboard' })).toBeNull()
  })

  it('returns null for /rating when logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/rating' })).toBeNull()
  })

  it('returns null for /settings when logged in', () => {
    expect(resolveRedirect({ ...base, currentPath: '/settings' })).toBeNull()
  })
})

describe('loading state', () => {
  it('redirects /team to /auth while loading (splash behaviour)', () => {
    expect(
      resolveRedirect({ isLoading: true, isLoggedIn: false, currentPath: '/team' }),
    ).toBe('/auth')
  })

  it('returns null for /auth while loading — already on auth screen', () => {
    expect(
      resolveRedirect({ isLoading: true, isLoggedIn: false, currentPath: '/auth' }),
    ).toBeNull()
  })

  it('redirects /dashboard to /auth while loading', () => {
    expect(
      resolveRedirect({ isLoading: true, isLoggedIn: false, currentPath: '/dashboard' }),
    ).toBe('/auth')
  })

  it('loading state takes priority over isLoggedIn=true — still redirects to /auth', () => {
    // Even though the user was previously authenticated, while the auth state
    // is resolving the guard treats every non-auth path as unverified.
    expect(
      resolveRedirect({ isLoading: true, isLoggedIn: true, currentPath: '/dashboard' }),
    ).toBe('/auth')
  })
})

describe('state transitions', () => {
  it('produces /auth redirect after session expires (logged-in → logged-out)', () => {
    const loggedIn: AuthState = { isLoading: false, isLoggedIn: true, currentPath: '/team' }
    const loggedOut: AuthState = { ...loggedIn, isLoggedIn: false }

    // While logged in on /team there should be no redirect.
    expect(resolveRedirect(loggedIn)).toBeNull()

    // Once the session expires the same path must redirect to /auth.
    expect(resolveRedirect(loggedOut)).toBe('/auth')
  })
})
