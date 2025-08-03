// Sound service using Web Audio API for game feedback sounds

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', this.initAudioContext, { once: true });
      document.addEventListener('keydown', this.initAudioContext, { once: true });
    }
  }

  private initAudioContext = () => {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    return oscillator;
  }

  private createGainNode(volume: number = 0.1): GainNode {
    if (!this.audioContext) return null as any;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    return gainNode;
  }

  // Play winning sound - ascending major chord
  playWinSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const duration = 0.6;

      // Create a major chord (C-E-G)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.createOscillator(freq, 'sine');
        const gainNode = this.createGainNode(0.05);
        
        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, now + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.05, now + index * 0.1 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.start(now + index * 0.1);
        oscillator.stop(now + duration);
      });
    } catch (error) {
      console.warn('Could not play win sound:', error);
    }
  }

  // Play correct play sound - pleasant single note
  playCorrectSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const duration = 0.3;

      const oscillator = this.createOscillator(880, 'sine'); // A5
      const gainNode = this.createGainNode(0.04);
      
      // Smooth envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Could not play correct sound:', error);
    }
  }

  // Play incorrect play sound - gentle warning tone
  playIncorrectSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;

      // Two-tone descending sound
      const frequencies = [440, 370]; // A4 to F#4
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.createOscillator(freq, 'triangle');
        const gainNode = this.createGainNode(0.03);
        
        const startTime = now + index * 0.15;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.03, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
      });
    } catch (error) {
      console.warn('Could not play incorrect sound:', error);
    }
  }

  // Play card flip/deal sound
  playCardSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const duration = 0.1;

      const oscillator = this.createOscillator(200, 'square');
      const gainNode = this.createGainNode(0.02);
      
      // Quick click sound
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Could not play card sound:', error);
    }
  }

  // Enable/disable sound
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const soundService = new SoundService();