import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Shield, Radio, Trophy, Users, Lock } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationModal } from './NotificationModal';
import { soundEffects } from '../services/soundEffects';
import {
  isNotificationsEnabled,
  getNotificationPermission
} from '../services/notifications';

interface NavbarProps {
  activeTab: 'matches' | 'standings' | 'teams' | 'badges' | 'admin' | 'notifications';
  setActiveTab: (tab: 'matches' | 'standings' | 'teams' | 'badges' | 'admin' | 'notifications') => void;
  isConnected: boolean;
  showAdminToPublic: boolean;
  isAdminLoggedIn: boolean;
  connectedClients?: number;
  onTestGoalAlert?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  showAdminToPublic,
  isAdminLoggedIn,
  connectedClients = 1,
  onTestGoalAlert
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isEnabled());
  const [notificationsActive, setNotificationsActive] = useState(true);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  useEffect(() => {
    setNotificationsActive(isNotificationsEnabled());
  }, [isNotifModalOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEffects.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundEffects.playWhistle();
    }
  };

  const handleOpenNotifModal = () => {
    setIsNotifModalOpen(true);
  };

  const shouldShowAdminTab = showAdminToPublic || isAdminLoggedIn;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top bar with branding and actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Live Badge */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveTab('matches')}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-white">LIGA MX</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      VIVO
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {isConnected ? `Sincronizado (${connectedClients} en línea)` : 'Conectando...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Controls: PWA, Sound, Notifications, Admin */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* In-App PWA Install */}
              <PWAInstallButton />

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-xl border text-xs transition ${
                  soundEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Sonido de estadio activado' : 'Silenciar efectos'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Botón de Notificaciones con Modal y Estado Claro */}
              <button
                onClick={handleOpenNotifModal}
                className={`p-2 rounded-xl border text-xs transition relative flex items-center gap-1.5 ${
                  notificationsActive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
                title="Configurar y activar notificaciones de Gol"
              >
                {notificationsActive ? (
                  <>
                    <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="hidden md:inline font-bold text-[11px] text-emerald-400">
                      Alertas ON
                    </span>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-slate-400" />
                    <span className="hidden md:inline font-medium text-[11px] text-slate-400">
                      Alertas OFF
                    </span>
                  </>
                )}
              </button>

              {/* Acceso Admin Opcional (desaparece completamente si oculto al público) */}
              {shouldShowAdminTab && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs (SofaScore / Flashscore style) */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/40">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'matches'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Partidos En Vivo</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'standings'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tabla General</span>
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'teams'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>18 Equipos (Atlante FC)</span>
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'badges'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Cambiar Escudos</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'notifications'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Configurar Alertas 🔔</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Modal de Configuración y Prueba de Notificaciones */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onTestGoalAlert={
          onTestGoalAlert ||
          (() => {
            soundEffects.playGoalHorn();
          })
        }
      />
    </>
  );
};
