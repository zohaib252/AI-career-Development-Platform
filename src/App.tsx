/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CareerProvider, useCareer } from './context/CareerContext';
import { ToastProvider } from './components/ui';
import { AppShell } from './components/layout/AppShell';
import { SignUpScreen } from './screens/SignUpScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { JobTitleScreen } from './screens/JobTitleScreen';
import { CVScreen } from './screens/CVScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';
import { JobResultsScreen } from './screens/JobResultsScreen';
import { SavedJobsScreen } from './screens/SavedJobsScreen';
import { MockInterviewScreen } from './screens/MockInterviewScreen';
import { ReportScreen } from './screens/ReportScreen';

/**
 * CareerPilot Router View
 * Renders SignUpScreen for unauthenticated visitors, or AppShell + active screen
 * with crisp 180ms page transitions that respect OS `prefers-reduced-motion`.
 */
const CareerPilotWorkspace: React.FC = () => {
  const { state, activeScreen } = useCareer();
  const prefersReducedMotion = useReducedMotion();

  if (!state.user || activeScreen === 'signup') {
    return <SignUpScreen />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'job-title':
        return <JobTitleScreen />;
      case 'cv':
        return <CVScreen />;
      case 'preferences':
        return <PreferencesScreen />;
      case 'jobs':
        return <JobResultsScreen />;
      case 'saved-jobs':
        return <SavedJobsScreen />;
      case 'interview':
        return <MockInterviewScreen />;
      case 'report':
        return <ReportScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <CareerProvider>
        <CareerPilotWorkspace />
      </CareerProvider>
    </ToastProvider>
  );
}
