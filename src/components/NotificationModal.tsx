import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Volume2, Sparkles, Smartphone, CheckCircle, AlertCircle, Play, ExternalLink } from 'lucide-react';
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
  requestNotificationPermission,
  getNotificationPermission,
  showNativeGoalNotification
} from '../services/notifications';
import { soundEffects } from '../services/soundEffects';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestGoalAlert: () => void;
  onOpenSettings?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onTestGoalAlert,
  onOpenSettings
}) => {
  const [enabled, setEnabled] = useState(isNotificationsEnabled());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnabled(isNotificationsEnabled());
      setPermission(getNotificationPermission());
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsIframeBlocked(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setNotificationsEnabled(next);

    if (next) {
      soundEffects.playWhistle();
      try {
        const res = await requestNotificationPermission();
        setPermission(res.permission);
        setIsIframeBlocked(res.isIframeBlocked);
      } catch {
        // En iframe puede fallar el permiso nativo pero las alertas en app siguen activas
      }
    }
  };

  const handleRequestNative = async () => {
    try {
      const res = await requestNotificationPermission();
      setPermission(res.permission);
      setIsIframeBlocked(res.isIframeBlocked);
      if (res.permission === 'granted') {
        soundEffects.playWhistle();
      }
    } catch {
      setIsIframeBlocked(true);
    }
  };

  const handleOpenDirectTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  const handleTestNotification = () => {
    soundEffects.playGoalHorn();
    onTestGoalAlert();

    showNativeGoalNotification({
      title: '¡GOOOOL DE PRUEBA! ⚽',
      body: 'Club América 2 - 1 Guadalajara (Minuto 68\')',
      icon: '/teams/america.png',
      badge: '/icon.svg'
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in text-left">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alertas y Notificaciones de Gol</h3>
              <p className="text-xs text-slate-400">Marcadores en vivo, sirena y bandeja del SO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switch Principal */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white block">
              Notificaciones de GOL en Vivo
            </span>
            <span className="text-xs text-slate-400 block">
              {enabled ? 'Alertas sonoras, banners emergentes y push activados' : 'Alertas desactivadas'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              enabled ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Estado y Diagnóstico */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Bandeja del Sistema Operativo:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                permission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {permission === 'granted'
                ? 'Permiso Concedido'
                : 'Alertas en Pantalla Activas'}
            </span>
          </div>

          <div className="pt-1 text-[11px] text-slate-300 space-y-2">
            <div className="flex items-start gap-1.5 text-emerald-400/90 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Las alertas visuales (banner flotante de gol con confeti) y sonoras (sirena de estadio) están <strong>100% activas</strong> en la aplicación.
              </span>
            </div>

            {permission !== 'granted' && (
              <div className="space-y-2 pt-1">
                <p className="text-slate-400 text-[11px]">
                  Para recibir alertas en la bandeja flotante de Windows/Mac/Android cuando la ventana esté en segundo plano:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRequestNative}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                  >
                    Solicitar Permiso Nativo
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDirectTab}
                    className="px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1.5"
                    title="Abrir en pestaña independiente para habilitar push en segundo plano"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Pestaña Directa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Prueba */}
        <button
          type="button"
          onClick={handleTestNotification}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{testSent ? '¡Sirena y Alerta de Gol Disparadas!' : 'Probar Alerta de Gol y Sirena'}</span>
        </button>

        {/* Botón a Configuración por Partido */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Configurar Alertas por Partido Específico ⚙️</span>
          </button>
        )}

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
        >
          Aceptar y Cerrar
        </button>
      </div>
    </div>
  );
};
