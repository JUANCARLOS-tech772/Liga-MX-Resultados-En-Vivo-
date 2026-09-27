import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LiveMatches } from './components/LiveMatches';
import { StandingsTable } from './components/StandingsTable';
import { TeamsGrid } from './components/TeamsGrid';
import { AdminPanel } from './components/AdminPanel';
import { BadgeManager } from './components/BadgeManager';
import { BadgeModal } from './components/BadgeModal';
import { GoalToast } from './components/GoalToast';
import { MatchDetailModal } from './components/MatchDetailModal';
import { NotificationSettings } from './components/NotificationSettings';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { Match } from './types';
import { WifiOff, RefreshCw, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'teams' | 'badges' | 'admin' | 'notifications'>('matches');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [modalBadgeTeamId, setModalBadgeTeamId] = useState<string | null>(null);

  const {
    teams,
    setTeams,
    matches,
    settings,
    isConnected,
    activeGoalAlert,
    setActiveGoalAlert,
    lastUpdatedTime,
    triggerGoalCelebration,
    refreshData
  } = useRealtimeSync();

  const handleBadgeUpdated = (teamId: string, newBadgeUrl: string) => {
    setTeams((prev) => {
      if (!prev[teamId]) return prev;
      return {
        ...prev,
        [teamId]: {
          ...prev[teamId],
          badgeUrl: newBadgeUrl
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Offline Alert Banner */}
      {!isConnected && (
        <div className="bg-amber-600/90 text-white text-xs font-bold py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Modo Reconexión: Restaurando conexión en tiempo real con el servidor central...</span>
        </div>
      )}

      {/* SofaScore-Style Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        showAdminToPublic={settings.showAdminToPublic}
        isAdminLoggedIn={isAdminLoggedIn}
        connectedClients={settings.connectedClients}
        onTestGoalAlert={() =>
          triggerGoalCelebration({
            title: '¡GOOOOL DE PRUEBA! ⚽',
            body: 'Club América 2 - 1 Chivas (Minuto 68\')',
            scoringTeam: 'Club América',
            badgeUrl: teams['america']?.badgeUrl || '/teams/america.png',
            minute: 68,
            isTest: true
          })
        }
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'matches' && (
          <LiveMatches
            matches={matches}
            teams={teams}
            onSelectMatch={(match) => setSelectedMatchForModal(match)}
            onEditTeamBadge={(teamId) => setModalBadgeTeamId(teamId)}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsTable
            matches={matches}
            teams={teams}
            onEditTeamBadge={(teamId) => setModalBadgeTeamId(teamId)}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsGrid
            teams={teams}
            onBadgeUpdated={handleBadgeUpdated}
          />
        )}

        {activeTab === 'badges' && (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
            <BadgeManager
              teams={teams}
              onBadgeUpdated={handleBadgeUpdated}
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings
            matches={matches}
            teams={teams}
            onTestGoalAlert={() =>
              triggerGoalCelebration({
                title: '¡GOOOOL DE PRUEBA! ⚽',
                body: 'Club América 2 - 1 Chivas (Minuto 68\')',
                scoringTeam: 'Club América',
                badgeUrl: teams['america']?.badgeUrl || '/teams/america.png',
                minute: 68,
                isTest: true
              })
            }
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            matches={matches}
            settings={settings}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            teams={teams}
            onBadgeUpdated={handleBadgeUpdated}
          />
        )}
      </main>

      {/* Modal flotante rápido para cambiar escudo desde cualquier lugar */}
      {modalBadgeTeamId && (
        <BadgeModal
          isOpen={!!modalBadgeTeamId}
          teamId={modalBadgeTeamId}
          teams={teams}
          onClose={() => setModalBadgeTeamId(null)}
          onBadgeUpdated={handleBadgeUpdated}
        />
      )}

      {/* Floating Goal Alert Banner (SofaScore / Flashscore style pop-up) */}
      <GoalToast
        alert={activeGoalAlert}
        onClose={() => setActiveGoalAlert(null)}
      />

      {/* Match Details & Stats Modal */}
      <MatchDetailModal
        match={selectedMatchForModal}
        teams={teams}
        onClose={() => setSelectedMatchForModal(null)}
      />

      {/* Minimal Dark Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Liga MX En Vivo • Sincronización Centralizada en Tiempo Real • Firebase Firestore</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Última sincronización API: {new Date(settings.lastApiSync).toLocaleTimeString('es-MX')}</span>
            <button
              onClick={() => refreshData()}
              className="hover:text-emerald-400 flex items-center gap-1 transition"
              title="Recargar datos"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
