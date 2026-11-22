import React from 'react';
import { LiveSqlFeed } from './LiveSqlFeed';
import { InvestigationBrief } from './InvestigationBrief';
import { UnseenInputSandbox } from './UnseenInputSandbox';
import { DiscrepancyCase, RunwayImpact, InvestigationFeedEvent } from '../types';

interface WorkspaceProps {
  currentCase: DiscrepancyCase | null;
  feedEvents: InvestigationFeedEvent[];
  runwayData: RunwayImpact | null;
  isInvestigating: boolean;
  onOpenCitation: (citationKey: string) => void;
  onOpenApproval: () => void;
  onSubmitCustomCase: (query: string, rawNarration?: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  currentCase,
  feedEvents,
  runwayData,
  isInvestigating,
  onOpenCitation,
  onOpenApproval,
  onSubmitCustomCase,
}) => {
  return (
    <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* Prominent Unseen Input Sandbox */}
      <UnseenInputSandbox
        isInvestigating={isInvestigating}
        onSubmit={onSubmitCustomCase}
      />

      {/* 50/50 Left/Right Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[640px]">
        {/* Left Column (5 of 12 columns): Obsidian SQL & UDF Terminal */}
        <section className="lg:col-span-5 h-full">
          <LiveSqlFeed
            events={feedEvents}
            isInvestigating={isInvestigating}
          />
        </section>

        {/* Right Column (7 of 12 columns): Cited Editorial Decision Brief */}
        <section className="lg:col-span-7 h-full">
          <InvestigationBrief
            currentCase={currentCase}
            runwayData={runwayData}
            isInvestigating={isInvestigating}
            onOpenCitation={onOpenCitation}
            onOpenApproval={onOpenApproval}
          />
        </section>
      </div>
    </main>
  );
};
