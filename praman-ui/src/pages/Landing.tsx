import React from 'react';
import { MarketingShell } from '../components/marketing/MarketingShell';
import { HeroShowcase } from '../components/marketing/HeroShowcase';
import { TrustStrip } from '../components/marketing/TrustStrip';
import { HowItWorksScenes } from '../components/marketing/HowItWorksScenes';
import { Footer } from '../components/marketing/Footer';

interface LandingProps {
  onLaunchWorkspace: (scenarioId?: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onLaunchWorkspace }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* 1. Dark Sticky Navigation Bar */}
      <MarketingShell onOpenWorkspace={onLaunchWorkspace} />

      {/* 2. Dark Obsidian Hero Section with Swaying Botanical Backdrop & Floating 3-Tab Window */}
      <HeroShowcase onLaunchWorkspace={onLaunchWorkspace} />

      {/* 3. Engineering Metrics & Trust Strip */}
      <TrustStrip />

      {/* 4. Three Editorial Narrative Scenes */}
      <HowItWorksScenes onOpenWorkspace={onLaunchWorkspace} />

      {/* 5. Minimal Dark Editorial Footer */}
      <Footer onOpenWorkspace={() => onLaunchWorkspace()} />
    </div>
  );
};
