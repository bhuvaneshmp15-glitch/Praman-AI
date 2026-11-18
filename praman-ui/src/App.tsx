import React, { useState, useEffect, useRef } from 'react';
import { DemoTriggerMenu } from './components/DemoTriggerMenu';
import { Workspace } from './components/Workspace';
import { CitationDetailModal } from './components/CitationDetailModal';
import { ApprovalCinematic } from './components/ApprovalCinematic';
import {
  HealthResponse,
  DiscrepancyCase,
  InvestigationFeedEvent,
  RunwayImpact,
  CitationDetailResponse,
  ApprovalResponse,
} from './types';
import {
  fetchHealth,
  fetchCases,
  fetchCase,
  triggerCase,
  fetchCitation,
  approveCase,
  subscribeToCaseStream,
} from './api/client';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [cases, setCases] = useState<DiscrepancyCase[]>([]);
  const [currentCase, setCurrentCase] = useState<DiscrepancyCase | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('CASE-GST-104');
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [feedEvents, setFeedEvents] = useState<InvestigationFeedEvent[]>([]);
  const [runwayData, setRunwayData] = useState<RunwayImpact | null>(null);

  // Citation Modal State
  const [isCitationOpen, setIsCitationOpen] = useState<boolean>(false);
  const [citationData, setCitationData] = useState<CitationDetailResponse | null>(null);
  const [isCitationLoading, setIsCitationLoading] = useState<boolean>(false);

  // Approval Cinematic State
  const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);

  // Active stream unsubscriber ref
  const streamUnsubRef = useRef<(() => void) | null>(null);

  // Initialize data on mount
  useEffect(() => {
    loadHealthAndCases();
    return () => {
      if (streamUnsubRef.current) streamUnsubRef.current();
    };
  }, []);

  const loadHealthAndCases = async () => {
    try {
      const [healthData, casesData] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchCases().catch(() => []),
      ]);

      if (healthData) setHealth(healthData);
      if (casesData && casesData.length > 0) {
        setCases(casesData);
        // Default to CASE-GST-104
        const defaultCase = casesData.find((c) => c.case_id === 'CASE-GST-104') || casesData[0];
        setCurrentCase(defaultCase);
        setActiveScenarioId(defaultCase.case_id);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  // 1-Click Scenario Trigger
  const handleTriggerScenario = async (scenarioId: string) => {
    if (streamUnsubRef.current) {
      streamUnsubRef.current();
      streamUnsubRef.current = null;
    }

    setIsInvestigating(true);
    setActiveScenarioId(scenarioId);
    setFeedEvents([]);
    setRunwayData(null);

    try {
      const res = await triggerCase(scenarioId);
      setCurrentCase(res.case);

      // Start SSE stream
      const unsub = subscribeToCaseStream(
        scenarioId,
        (eventType, data) => {
          const newEvent: InvestigationFeedEvent = {
            id: `${Date.now()}-${Math.random()}`,
            type: eventType as any,
            timestamp: new Date().toISOString(),
            data,
          };

          setFeedEvents((prev) => [...prev, newEvent]);

          if (eventType === 'runway_calculated') {
            setRunwayData(data);
          }

          if (eventType === 'brief_completed') {
            setCurrentCase((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'BRIEF_READY',
                    brief: data,
                    actions: data.actions || [],
                    citations: data.citations || [],
                  }
                : null
            );
          }
        },
        (error) => {
          console.error('SSE Stream error:', error);
          setIsInvestigating(false);
        },
        () => {
          setIsInvestigating(false);
        }
      );

      streamUnsubRef.current = unsub;
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
      setIsInvestigating(false);
    }
  };

  // Citation Click
  const handleOpenCitation = async (citationKey: string) => {
    if (!currentCase) return;
    setIsCitationOpen(true);
    setIsCitationLoading(true);

    try {
      const citDetail = await fetchCitation(currentCase.case_id, citationKey);
      setCitationData(citDetail);
    } catch (err) {
      console.error(`Failed to load citation ${citationKey}:`, err);
    } finally {
      setIsCitationLoading(false);
    }
  };

  // Human Approval Execution
  const handleExecuteApproval = async (): Promise<ApprovalResponse> => {
    if (!currentCase) throw new Error('No active case');
    const result = await approveCase(currentCase.case_id, currentCase.brief?.actions);

    // Update case status to APPROVED
    setCurrentCase((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));

    return result;
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      {/* Top Bar & 1-Click Judge Scenario Bar */}
      <DemoTriggerMenu
        health={health}
        activeScenarioId={activeScenarioId}
        isInvestigating={isInvestigating}
        onTriggerScenario={handleTriggerScenario}
      />

      {/* Main 50/50 Split Workspace */}
      <Workspace
        currentCase={currentCase}
        feedEvents={feedEvents}
        runwayData={runwayData}
        isInvestigating={isInvestigating}
        onOpenCitation={handleOpenCitation}
        onOpenApproval={() => setIsApprovalOpen(true)}
      />

      {/* Citation Evidence Deep-Dive Modal */}
      <CitationDetailModal
        isOpen={isCitationOpen}
        onClose={() => setIsCitationOpen(false)}
        citationData={citationData}
        isLoading={isCitationLoading}
      />

      {/* 1-Click Human Approval Cinematic Drawer */}
      <ApprovalCinematic
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        caseId={currentCase?.case_id || 'CASE-GST-104'}
        actions={currentCase?.brief?.actions || []}
        onExecuteApproval={handleExecuteApproval}
      />
    </div>
  );
};

export default App;
