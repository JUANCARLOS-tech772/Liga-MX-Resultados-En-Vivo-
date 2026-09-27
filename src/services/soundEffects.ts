/**
 * Sintetizador Web Audio API para alertas deportivas
 * Sonidos alegres, festivos y modernos estilo SofaScore / FIFA / ESPN.
 * Sin archivos pesados externos, compatible con cualquier navegador y dispositivo móvil.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext se inicializa en la primera interacción
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Alerta sonora de ¡GOL! Festiva, brillante y alegre (Fanfarria mayor deportiva)
   * Toca un arpegio ascendente brillante (Do5 -> Mi5 -> Sol5 -> Do6) seguido de un acorde triunfal.
   */
  public playGoalHorn() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Secuencia de notas triunfales (Do5 -> Mi5 -> Sol5 -> Do6)
      const notes = [
        { freq: 523.25, time: 0.00, duration: 0.16 }, // C5
        { freq: 659.25, time: 0.12, duration: 0.16 }, // E5
        { freq: 783.99, time: 0.24, duration: 0.20 }, // G5
        { freq: 1046.50, time: 0.38, duration: 0.70 } // C6 (agudo festivo)
      ];

      notes.forEach(({ freq, time, duration }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Onda triangular con armónico suave para sonido cálido y festivo
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.linearRampToValueAtTime(0.28, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration);
      });

      // Acorde triunfal de celebración de fondo (Do + Sol + Mi)
      const chordTime = now + 0.38;
      const chordFreqs = [523.25, 659.25, 783.99, 1046.50];

      chordFreqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);

        gain.gain.setValueAtTime(0.001, chordTime);
        gain.gain.linearRampToValueAtTime(0.12, chordTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(chordTime);
        osc.stop(chordTime + 0.95);
      });
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }

  /**
   * Silbato de confirmación y selección (agradable y nítido)
   */
  public playWhistle() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, now); // C6
      osc.frequency.linearRampToValueAtTime(1318.51, now + 0.06); // E6
      osc.frequency.linearRampToValueAtTime(1567.98, now + 0.12); // G6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }
}

export const soundEffects = new SoundEffectsService();
