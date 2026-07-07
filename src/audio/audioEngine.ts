type AudioContextConstructor = typeof AudioContext;

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

type MusicVoice = {
  frequency: number;
  delay: number;
  duration: number;
  gain: number;
  type: OscillatorType;
};

const AUDIO_ENABLED_KEY = "ecoboat.audioEnabled";
const MUSIC_INTERVAL_MS = 620;
const musicScale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
const musicPattern = [0, 2, 4, 5, 4, 2, 1, 3, 5, 7, 5, 4, 2, 0, 2, 4];

function getStoredAudioEnabled(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(AUDIO_ENABLED_KEY) !== "false";
}

class EcoboatAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private enabled = getStoredAudioEnabled();

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUDIO_ENABLED_KEY, String(enabled));
    }

    if (!enabled) {
      this.stopMusic();
      return;
    }

    void this.ensureContext();
  }

  async startMusic() {
    if (!this.enabled || this.musicTimer !== null) {
      return;
    }

    const context = await this.ensureContext();
    if (!context || !this.musicGain) {
      return;
    }

    this.musicGain.gain.cancelScheduledValues(context.currentTime);
    this.musicGain.gain.setTargetAtTime(0.16, context.currentTime, 0.65);
    this.scheduleMusicStep();
    this.musicTimer = window.setInterval(() => this.scheduleMusicStep(), MUSIC_INTERVAL_MS);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    if (this.context && this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.context.currentTime);
      this.musicGain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.35);
    }
  }

  async playStart() {
    await this.playBell([523.25, 659.25, 783.99], 0.1);
  }

  async playTrashPickup(points: number) {
    const base = points >= 25 ? 783.99 : points >= 20 ? 659.25 : points >= 15 ? 587.33 : 523.25;
    await this.playBell([base, base * 1.5], 0.075);
  }

  async playDamage() {
    const context = await this.ensureContext();
    const sfxGain = this.sfxGain;

    if (!context || !sfxGain || !this.enabled) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(170, now);
    oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.32);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.34);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    oscillator.start(now);
    oscillator.stop(now + 0.42);
  }

  async playGameOver() {
    this.stopMusic();
    await this.playBell([392, 329.63, 261.63], 0.18, "triangle");
  }

  async playToggle() {
    await this.playBell([440], 0.06);
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.context) {
      const AudioCtor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;

      if (!AudioCtor) {
        return null;
      }

      this.context = new AudioCtor();
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();

      this.masterGain.gain.value = 0.75;
      this.musicGain.gain.value = 0.0001;
      this.sfxGain.gain.value = 0.42;
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    return this.context;
  }

  private scheduleMusicStep() {
    if (!this.context || !this.musicGain || !this.enabled) {
      return;
    }

    const context = this.context;
    const step = this.musicStep;
    const rootIndex = musicPattern[step % musicPattern.length];
    const root = musicScale[rootIndex];
    const voices: MusicVoice[] = [
      { frequency: root, delay: 0, duration: 1.3, gain: 0.038, type: "sine" },
      { frequency: root * 1.5, delay: 0.03, duration: 1.1, gain: 0.02, type: "triangle" },
    ];

    if (step % 4 === 0) {
      voices.push({ frequency: root / 2, delay: 0.01, duration: 1.8, gain: 0.024, type: "sine" });
    }

    voices.forEach((voice) => this.playVoice(voice, context.currentTime + voice.delay));
    this.musicStep += 1;
  }

  private playVoice(voice: MusicVoice, startAt: number) {
    if (!this.context || !this.musicGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(voice.frequency, startAt);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(voice.gain, startAt + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + voice.duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + voice.duration + 0.05);
  }

  private async playBell(notes: number[], spacing: number, type: OscillatorType = "sine") {
    const context = await this.ensureContext();
    const sfxGain = this.sfxGain;

    if (!context || !sfxGain || !this.enabled) {
      return;
    }

    notes.forEach((note, index) => {
      const now = context.currentTime + index * spacing;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      oscillator.connect(gain);
      gain.connect(sfxGain);
      oscillator.start(now);
      oscillator.stop(now + 0.36);
    });
  }
}

export const audioEngine = new EcoboatAudioEngine();
