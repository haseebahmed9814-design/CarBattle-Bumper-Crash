const SoundEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    getGain() { return UserSettings.masterVolume * UserSettings.sfxVolume; },
    playUIClick() {
        this.init();
        if (!this.ctx) return;
        const vol = this.getGain() * 0.25;
        if (vol <= 0.001) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(810, now + 0.05);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.065);
    },
    playCountdownBeep(isFinal = false) {
        this.init();
        if (!this.ctx) return;
        const vol = this.getGain() * 0.35;
        if (vol <= 0.001) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.18));
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + (isFinal ? 0.36 : 0.2));
    },
    playCrash(intensity = 1.0) {
        this.init();
        if (!this.ctx) return;
        const master = this.getGain();
        if (master <= 0.001) return;
        const now = this.ctx.currentTime;
        const vol = Math.min(1, Math.max(0.15, intensity)) * master;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(135 * (0.8 + intensity * 0.35), now);
        osc.frequency.exponentialRampToValueAtTime(26, now + 0.24);
        gain.gain.setValueAtTime(vol * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.26);

        const bufLen = Math.floor(this.ctx.sampleRate * 0.18);
        const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.35));
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 880;
        const nGain = this.ctx.createGain();
        nGain.gain.value = vol * 0.5;
        noise.connect(filter); filter.connect(nGain); nGain.connect(this.ctx.destination);
        noise.start(now);
    },
    playExplosion() {
        this.init();
        if (!this.ctx) return;
        const master = this.getGain();
        if (master <= 0.001) return;
        const now = this.ctx.currentTime;
        const bufLen = Math.floor(this.ctx.sampleRate * 0.75);
        const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.28));
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(460, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.72);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.85 * master, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.74);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start(now);
    }
};
