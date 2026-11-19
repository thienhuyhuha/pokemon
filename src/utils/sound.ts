type BgmMode = 'off' | 'menu' | 'battle';

const BGM_STORAGE_KEY = 'chibimon_bgm_enabled_v1';

// MIDI note number -> frequency (Hz)
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 32 eighth-note steps (4 bars in 4/4) — upbeat cheerful adventure loop in C Major
// Lead MIDI notes (0 = rest)
const MENU_LEAD: number[] = [
  72, 0, 76, 79, 76, 0, 72, 0, // C5 E5 G5 E5 C5
  74, 0, 79, 74, 71, 0, 0, 0,  // D5 G5 D5 B4
  72, 0, 76, 81, 79, 0, 76, 0, // C5 E5 A5 G5 E5
  74, 76, 74, 72, 71, 0, 67, 0 // D5 E5 D5 C5 B4 G4
];

const BATTLE_LEAD: number[] = [
  // Bars 1-4: C -> G -> Am -> Em
  72, 76, 79, 0, 84, 0, 79, 76,
  74, 79, 83, 0, 79, 0, 74, 71,
  69, 72, 76, 0, 81, 0, 79, 76,
  71, 76, 79, 0, 76, 0, 74, 71,
  // Bars 5-8: F -> C -> Dm7 -> G7
  77, 0, 81, 77, 76, 0, 72, 0,
  76, 0, 79, 76, 72, 0, 76, 79,
  74, 77, 81, 0, 79, 77, 74, 72,
  74, 0, 79, 83, 84, 0, 79, 0,
];

// Bass line per eighth-note step (64 steps matching BATTLE_LEAD)
const BATTLE_BASS: number[] = [
  // C
  48, 0, 55, 0, 48, 0, 55, 0,
  // G
  43, 0, 50, 0, 43, 0, 50, 0,
  // Am
  45, 0, 52, 0, 45, 0, 52, 0,
  // Em
  40, 0, 47, 0, 40, 0, 47, 0,
  // F
  41, 0, 48, 0, 41, 0, 48, 0,
  // C
  48, 0, 55, 0, 48, 0, 55, 0,
  // Dm
  50, 0, 57, 0, 50, 0, 57, 0,
  // G7
  43, 0, 50, 0, 55, 0, 43, 0,
];

function loadSavedBgmPref(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(BGM_STORAGE_KEY);
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxMaster: GainNode | null = null;
  private bgmMaster: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  public enabled = true;
  private _bgmEnabled = loadSavedBgmPref();
  private bgmMode: BgmMode = 'off';
  private hurry = false;
  private stepIdx = 0;
  private nextNoteTime = 0;
  private schedulerId: number | null = null;
  private visibilityHooked = false;

  public get bgmEnabled(): boolean {
    return this._bgmEnabled;
  }

  public setBgmEnabled(val: boolean): void {
    this._bgmEnabled = val;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(BGM_STORAGE_KEY, val ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
    }
    this.syncBgmPlayback();
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    this.syncBgmPlayback();
  }

  public setBgmState(mode: BgmMode, hurry = false): void {
    const changed = this.bgmMode !== mode || this.hurry !== hurry;
    this.bgmMode = mode;
    this.hurry = hurry;
    if (changed) {
      if (mode === 'off') {
        this.stopScheduler();
      } else {
        this.syncBgmPlayback();
      }
    }
  }

  public unlock(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume()
        .then(() => this.syncBgmPlayback())
        .catch(() => {});
    } else {
      this.syncBgmPlayback();
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.sfxMaster = this.ctx.createGain();
      this.sfxMaster.gain.value = 0.9;
      this.sfxMaster.connect(this.ctx.destination);

      this.bgmMaster = this.ctx.createGain();
      this.bgmMaster.gain.value = 0.24;
      this.bgmMaster.connect(this.ctx.destination);

      this.createNoiseBuffer(this.ctx);
    }

    if (!this.visibilityHooked && typeof document !== 'undefined') {
      this.visibilityHooked = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopScheduler();
        } else {
          this.syncBgmPlayback();
        }
      });
    }

    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): void {
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buf;
  }

  private getSfxContext(): { ctx: AudioContext; out: AudioNode } | null {
    if (!this.enabled) return null;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMaster) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return { ctx, out: this.sfxMaster };
  }

  private syncBgmPlayback(): void {
    if (
      !this.enabled ||
      !this._bgmEnabled ||
      this.bgmMode === 'off' ||
      (typeof document !== 'undefined' && document.hidden)
    ) {
      this.stopScheduler();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.bgmMaster) return;

    const targetGain = this.bgmMode === 'menu' ? 0.16 : 0.25;
    try {
      this.bgmMaster.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    } catch {
      this.bgmMaster.gain.value = targetGain;
    }

    if (ctx.state === 'suspended') {
      // Wait for user interaction to resume
      return;
    }

    if (this.schedulerId === null) {
      this.stepIdx = 0;
      this.nextNoteTime = ctx.currentTime + 0.06;
      this.schedulerId = window.setInterval(() => this.scheduleAhead(), 45);
    }
  }

  private stopScheduler(): void {
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  private scheduleAhead(): void {
    if (
      !this.enabled ||
      !this._bgmEnabled ||
      this.bgmMode === 'off' ||
      !this.ctx ||
      !this.bgmMaster ||
      this.ctx.state !== 'running'
    ) {
      this.stopScheduler();
      return;
    }

    const lookahead = 0.14;
    const bpm = this.bgmMode === 'menu' ? 104 : this.hurry ? 140 : 124;
    const eighthNoteSec = 60 / bpm / 2;

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.scheduleStep(this.stepIdx, this.nextNoteTime, eighthNoteSec);
      this.nextNoteTime += eighthNoteSec;
      const loopLen = this.bgmMode === 'menu' ? MENU_LEAD.length : BATTLE_LEAD.length;
      this.stepIdx = (this.stepIdx + 1) % loopLen;
    }
  }

  private scheduleStep(step: number, time: number, stepDur: number): void {
    if (!this.ctx || !this.bgmMaster) return;

    const leadArray = this.bgmMode === 'menu' ? MENU_LEAD : BATTLE_LEAD;
    const leadMidi = leadArray[step % leadArray.length];
    const bassMidi = BATTLE_BASS[step % BATTLE_BASS.length];

    // Warm marimba-like lead voice
    if (leadMidi > 0) {
      const freq = midiToFreq(leadMidi);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      const peak = this.bgmMode === 'menu' ? 0.16 : 0.2;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 1.45);

      osc.connect(gain);
      gain.connect(this.bgmMaster);
      osc.start(time);
      osc.stop(time + stepDur * 1.5);
    }

    // Warm bass voice
    if (bassMidi > 0) {
      const freq = midiToFreq(bassMidi);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const peak = this.bgmMode === 'menu' ? 0.15 : 0.24;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 1.8);

      osc.connect(gain);
      gain.connect(this.bgmMaster);
      osc.start(time);
      osc.stop(time + stepDur * 1.85);
    }

    // Light crisp off-beat shaker in battle mode
    if (this.bgmMode === 'battle' && step % 2 === 1 && this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.055, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMaster);
      src.start(time);
      src.stop(time + 0.045);
    }
  }

  public playSelect(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Satisfying multi-layered pair-match sound:
   * 1) Snappy pop impact
   * 2) Ascending bell chime scaled with combo streak
   * 3) Extra sparkle octave shimmer for combos >= 3
   */
  public playMatch(combo: number): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    // 1. Snappy pop transient
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(420, now);
    popOsc.frequency.exponentialRampToValueAtTime(150, now + 0.045);
    popGain.gain.setValueAtTime(0.18, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    popOsc.connect(popGain);
    popGain.connect(out);
    popOsc.start(now);
    popOsc.stop(now + 0.06);

    // 2. Ascending bright chime arpeggio
    const semitoneStep = Math.min(Math.max(0, combo - 1), 10);
    const baseFreq = 523.25 * Math.pow(1.059463, semitoneStep); // starts at C5
    const notes = combo >= 3
      ? [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]
      : [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      const start = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.23);
    });
  }

  public playMismatch(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(195, now);
    osc.frequency.linearRampToValueAtTime(135, now + 0.13);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playShuffle(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    [340, 440, 580].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  public playHint(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    [660, 880, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  public playWin(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    fanfare.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.085;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playGameOver(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    [392, 349.23, 311.13, 261.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public playTick(): void {
    const audio = this.getSfxContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const sound = new SoundManager();
