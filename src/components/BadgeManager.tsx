import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Link,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Shield,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Download,
  FileCode
} from 'lucide-react';
import { Team } from '../types';
import { saveTeamBadgeToFirestore } from '../services/firebaseFirestore';

interface BadgeManagerProps {
  teams: Record<string, Team>;
  initialTeamId?: string;
  onBadgeUpdated?: (teamId: string, newBadgeUrl: string) => void;
  adminPassword?: string;
}

export const BadgeManager: React.FC<BadgeManagerProps> = ({
  teams,
  initialTeamId = 'america',
  onBadgeUpdated,
  adminPassword
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [base64Payload, setBase64Payload] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const teamList = Object.values(teams);
  const currentTeam = teams[selectedTeamId] || teamList[0];

  useEffect(() => {
    if (initialTeamId && teams[initialTeamId]) {
      setSelectedTeamId(initialTeamId);
      setPreviewUrl('');
      setCustomUrl('');
      setBase64Payload('');
    }
  }, [initialTeamId]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Manejar selección de archivo desde el dispositivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Por favor selecciona un archivo de imagen válido (PNG, SVG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64Payload(result);
      setPreviewUrl(result);
      setCustomUrl('');
      showStatus('Imagen cargada desde tu dispositivo. Pulsa «Guardar Escudo» para aplicar en toda la app.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Guardar nuevo escudo en el servidor y Firebase Firestore
  const handleSaveBadge = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || customUrl || previewUrl;
    if (!targetUrl && !base64Payload) {
      showStatus('Sube un archivo, elige un escudo oficial o escribe la URL antes de guardar.', 'error');
      return;
    }

    setIsSaving(true);
    const pwd = adminPassword || sessionStorage.getItem('ligamx_admin_pwd') || 'ligamx2026';

    try {
      // 1. Guardar en el servidor backend (y almacenamiento en disco)
      const res = await fetch('/api/admin/teams/update-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          teamId: currentTeam.id,
          badgeUrl: targetUrl,
          base64Data: base64Payload || undefined
        })
      });

      const data = await res.json();
      const savedBadgeUrl = data.team?.badgeUrl || targetUrl;

      // 2. Guardar en Firestore para sincronización en la nube (Proyecto appreultados)
      if (savedBadgeUrl) {
        saveTeamBadgeToFirestore(currentTeam.id, savedBadgeUrl).catch(() => {});
      }

      // 3. Guardar en localStorage para respaldo instantáneo en el navegador
      try {
        const localCustom = JSON.parse(localStorage.getItem('ligamx_custom_badges') || '{}');
        localCustom[currentTeam.id] = savedBadgeUrl;
        localStorage.setItem('ligamx_custom_badges', JSON.stringify(localCustom));
      } catch {}

      if (res.ok && data.success) {
        showStatus(`¡Escudo de ${currentTeam.name} actualizado con éxito! Se aplicó en partidos, tablas y alertas.`, 'success');
        if (onBadgeUpdated) {
          onBadgeUpdated(currentTeam.id, savedBadgeUrl);
        }
        setBase64Payload('');
        setPreviewUrl('');
        setCustomUrl('');
      } else {
        // Fallback local si el servidor da algún aviso
        if (onBadgeUpdated && savedBadgeUrl) {
          onBadgeUpdated(currentTeam.id, savedBadgeUrl);
        }
        showStatus(`Escudo de ${currentTeam.name} aplicado correctamente en la vista.`, 'success');
      }
    } catch {
      // Si la red falla, aplicar localmente y en localStorage
      const fallbackUrl = targetUrl || previewUrl;
      if (fallbackUrl && onBadgeUpdated) {
        onBadgeUpdated(currentTeam.id, fallbackUrl);
        try {
          const localCustom = JSON.parse(localStorage.getItem('ligamx_custom_badges') || '{}');
          localCustom[currentTeam.id] = fallbackUrl;
          localStorage.setItem('ligamx_custom_badges', JSON.stringify(localCustom));
        } catch {}
      }
      showStatus('Escudo aplicado localmente y guardado en tu navegador.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Restablecer al escudo original de base
  const handleResetBadge = async () => {
    setIsSaving(true);
    const pwd = adminPassword || sessionStorage.getItem('ligamx_admin_pwd') || 'ligamx2026';
    const defaultUrl = `/teams/${currentTeam.id}.png`;

    try {
      const res = await fetch('/api/admin/teams/reset-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          teamId: currentTeam.id
        })
      });

      // Limpiar en Firestore
      saveTeamBadgeToFirestore(currentTeam.id, defaultUrl).catch(() => {});

      // Limpiar en localStorage
      try {
        const localCustom = JSON.parse(localStorage.getItem('ligamx_custom_badges') || '{}');
        delete localCustom[currentTeam.id];
        localStorage.setItem('ligamx_custom_badges', JSON.stringify(localCustom));
      } catch {}

      showStatus(`Escudo de ${currentTeam.name} restablecido al original de base.`, 'success');
      setPreviewUrl('');
      setBase64Payload('');
      setCustomUrl('');
      if (onBadgeUpdated) {
        onBadgeUpdated(currentTeam.id, defaultUrl);
      }
    } catch {
      if (onBadgeUpdated) {
        onBadgeUpdated(currentTeam.id, defaultUrl);
      }
      showStatus(`Escudo de ${currentTeam.name} restablecido al original.`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTeams = teamList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header descriptivo */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Cambiar / Personalizar Escudos de Base
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Elige cualquier equipo, sube una imagen de tu dispositivo o selecciona entre escudos oficiales verificados en alta resolución.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0">
            Sincronizado en Tiempo Real + Firebase
          </span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'bg-red-950/90 text-red-300 border-red-500/50'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Selector de Equipo con Búsqueda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            1. Selecciona el club que deseas modificar ({filteredTeams.length} clubes):
          </label>
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {filteredTeams.map((t) => {
            const isSelected = t.id === currentTeam.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTeamId(t.id);
                  setPreviewUrl('');
                  setBase64Payload('');
                  setCustomUrl('');
                }}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900/80 p-1 flex items-center justify-center shrink-0 border border-slate-800">
                  <img
                    src={t.badgeUrl}
                    alt={t.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = t.fallbackBadge;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black truncate block">{t.shortName}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{t.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor del Escudo Seleccionado */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        {/* Vista previa en vivo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Escudo Actual
              </span>
              <div className="w-24 h-24 rounded-2xl bg-slate-950 p-2.5 flex items-center justify-center border border-slate-700/80 shadow-inner">
                <img
                  src={currentTeam.badgeUrl}
                  alt={currentTeam.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = currentTeam.fallbackBadge;
                  }}
                />
              </div>
            </div>

            {previewUrl && (
              <>
                <span className="text-emerald-400 font-black text-2xl animate-pulse">➔</span>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    Nuevo Escudo (Previa)
                  </span>
                  <div className="w-24 h-24 rounded-2xl bg-slate-950 p-2.5 flex items-center justify-center border-2 border-emerald-400 shadow-lg shadow-emerald-500/20">
                    <img
                      src={previewUrl}
                      alt="Nuevo escudo"
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="text-xl font-black text-white">{currentTeam.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold">
                {currentTeam.shortName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentTeam.stadium} • {currentTeam.city}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono break-all line-clamp-1">
              Ruta activa: {currentTeam.badgeUrl}
            </p>
          </div>
        </div>

        {/* Galería de Escudos Oficiales HD Verificados (1-Clic para elegir) */}
        {currentTeam.officialPresets && currentTeam.officialPresets.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Escudos Oficiales HD Verificados para {currentTeam.shortName} (Haz clic para seleccionar):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentTeam.officialPresets.map((preset, idx) => {
                const isCurrent = currentTeam.badgeUrl === preset.url;
                const isSelected = previewUrl === preset.url;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPreviewUrl(preset.url);
                      setCustomUrl(preset.url);
                      setBase64Payload('');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition text-left ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/40 text-white'
                        : isCurrent
                        ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-950 p-1 flex items-center justify-center shrink-0 border border-slate-800">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = currentTeam.fallbackBadge;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {isCurrent ? 'Escudo activo' : 'Clic para aplicar'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Métodos de Subida Personalizada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción A: Subir imagen de tu computadora / móvil */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Opción A: Subir imagen de tu computadora o móvil</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Carga tu propio archivo PNG con transparencia, SVG o JPG oficial directamente desde tu galería o explorador de archivos.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>{base64Payload ? 'Cambiar archivo seleccionado...' : 'Elegir archivo de imagen...'}</span>
            </button>
          </div>

          {/* Opción B: Pegar enlace URL de internet */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Link className="w-4 h-4 text-emerald-400" />
              <span>Opción B: Pegar enlace / URL web directo</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pega la URL de cualquier escudo en la web (por ejemplo, desde Wikipedia, FotMob o ESPN).
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://ejemplo.com/escudo.png"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                  setBase64Payload('');
                }}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSaveBadge()}
            disabled={isSaving || (!previewUrl && !customUrl && !base64Payload)}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Guardar Escudo de {currentTeam.shortName} para Toda la App</span>
          </button>

          <button
            type="button"
            onClick={handleResetBadge}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Volver al escudo original incluido"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restablecer Original de Base</span>
          </button>
        </div>
      </div>
    </div>
  );
};
