/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileAppView } from './components/MobileAppView';
import { AdminPanelShell } from './admin_panel/AdminPanelShell';
import { AdminLoginScreen } from './admin_panel/AdminLoginScreen';
import { ReferralLandingPage } from './screens/ReferralLandingPage';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { referralService } from './services/referralService';
import {
  isAdminSessionValid,
  isConfiguredAdminEmail,
  logoutAdmin
} from './services/adminAuthService';

interface RouteLocation {
  pathname: string;
  search: string;
}

function normalizePathname(rawPath: string): string {
  const trimmed = (rawPath || '/').replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function readCurrentLocation(): RouteLocation {
  return {
    pathname: normalizePathname(window.location.pathname),
    search: window.location.search || ''
  };
}

const MainAppContent: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [locationState, setLocationState] = useState<RouteLocation>(() => readCurrentLocation());
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(() => isAdminSessionValid());

  const navigateTo = useCallback((targetPath: string, replace = false) => {
    try {
      if (replace) {
        window.history.replaceState({}, '', targetPath);
      } else {
        window.history.pushState({}, '', targetPath);
      }
      setLocationState(readCurrentLocation());
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      window.location.assign(targetPath);
    }
  }, []);

  // Listen to browser back/forward history changes
  useEffect(() => {
    const handlePopState = () => {
      setLocationState(readCurrentLocation());
      setAdminAuthenticated(isAdminSessionValid());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect and persist referral codes whenever URL changes (?ref=... or /invite/...)
  const urlRefCode = referralService.extractUrlReferralCode();
  useEffect(() => {
    if (urlRefCode) {
      referralService.detectDeepLinkReferral();
    }
  }, [locationState.pathname, locationState.search, urlRefCode]);

  const { pathname } = locationState;

  // 1. STRICTLY PROTECTED ADMIN ROUTE (/admin)
  if (pathname === '/admin') {
    // If a non-admin regular player is logged in without an admin session, block access with 404/Unauthorized
    const isUnauthorizedPlayer =
      Boolean(currentUser) && !isConfiguredAdminEmail(currentUser?.email) && !adminAuthenticated;

    if (isUnauthorizedPlayer) {
      return <NotFoundScreen onGoHome={() => navigateTo('/', true)} />;
    }

    if (!adminAuthenticated) {
      return (
        <AdminLoginScreen
          onSuccess={() => setAdminAuthenticated(true)}
          onGoToApp={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminPanelShell
        onExitToApp={() => navigateTo('/')}
        onAdminLogout={async () => {
          await logoutAdmin();
          setAdminAuthenticated(false);
          navigateTo('/admin', true);
        }}
      />
    );
  }

  // Block any unknown nested /admin/* routes
  if (pathname.startsWith('/admin/')) {
    return <NotFoundScreen onGoHome={() => navigateTo('/', true)} />;
  }

  // 2. CONDITIONAL REFERRAL LANDING PAGE (?ref=... or /invite/...)
  const isInviteRoute = pathname === '/invite' || pathname.startsWith('/invite/');
  const isReferralVisit = Boolean(urlRefCode) || isInviteRoute;

  if (isReferralVisit && (pathname === '/' || isInviteRoute)) {
    return (
      <ReferralLandingPage
        referralCode={urlRefCode}
        onContinueOnWeb={() => {
          if (urlRefCode) {
            try {
              sessionStorage.setItem('ffarena_pending_ref_code', urlRefCode);
            } catch {
              // ignore
            }
          }
          // Ensure guest sees Sign Up / Login cleanly when arriving from a referral invite
          if (currentUser) {
            logout();
          }
          navigateTo('/', true);
        }}
      />
    );
  }

  // 3. DEFAULT USER INTERFACE (/) -> Goes straight to Sign Up / Login when unauthenticated
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return (
      <div className="min-h-screen w-full bg-[#06080e] text-slate-100 flex justify-center font-body antialiased">
        <div className="w-full max-w-md min-h-screen bg-[#090d16] shadow-2xl border-x border-slate-800/70">
          <MobileAppView />
        </div>
      </div>
    );
  }

  // 4. UNKNOWN ROUTES -> 404 PAGE
  return <NotFoundScreen onGoHome={() => navigateTo('/', true)} />;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
