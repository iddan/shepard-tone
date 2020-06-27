/**
 * @see {@link https://jordaneldredge.com/blog/creating-the-shepard-tone-audio-illusion-with-javascript/ | The article this code is based on}
 */

const INITIAL_STEP = 0;
const GAIN_VOLUME_FACTOR = 12;

/**
 * @example Usage
 * ```typescript
 * const shepardTone = new ShepardTone(createAudioContext());
 * shepardTone.play();
 * ```
 */
export class ShepardTone {
  private gainNode: GainNode;
  private oscillatorNodes: OscillatorNode[];
  private currentStep: number = INITIAL_STEP;
  private timeout: number | null = null;
  private playing: boolean = false;

  constructor(
    readonly audioContext: AudioContext,
    /** The minimum frequency the tone will reach */
    public minimumFrequency = 10,
    /** The maximum frequency the tone will reach */
    public maximumFrequency = 22050,
    /** Number of steps a tone loop consists of, an integer bigger than one */
    public loopStepsCount = 12,
    /** Duration of the loop in milliseconds */
    public loopDuration = 5000
  ) {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.volume = 1;
    this.oscillatorNodes = new Array(this.loopStepsCount).fill(null);
  }

  private playStep = () => {
    const multiplier = Math.pow(2, 1 / this.loopStepsCount);
    const stepSpeed = this.loopDuration / this.loopStepsCount;
    let baseFrequency = this.minimumFrequency;
    this.oscillatorNodes = this.oscillatorNodes.map(
      (existingOscillatorNode) => {
        if (existingOscillatorNode) {
          existingOscillatorNode.stop(0);
        }

        const frequency =
          baseFrequency * Math.pow(multiplier, this.currentStep);
        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = frequency; // value in hertz
        oscillator.connect(this.gainNode);
        oscillator.start(0);
        baseFrequency = baseFrequency * 2;
        return oscillator;
      }
    );
    this.currentStep = (this.currentStep + 1) % this.loopStepsCount;
    this.timeout = setTimeout(this.playStep, stepSpeed);
  };

  /**
   * Begin playback of the tone, if the tone is already in a playing state this method will have no effect.
   */
  play(): void {
    if (this.playing) {
      return;
    }
    this.playing = true;
    this.playStep();
  }

  /**
   * Pauses the playback of the tone, if the tone is already in a paused state this method will have no effect.
   */
  pause(): void {
    this.playing = false;
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    for (const node of this.oscillatorNodes) {
      node.stop(0);
    }
  }

  /**
   * Resets the playback of the tone
   */
  reset(): void {
    this.currentStep = INITIAL_STEP;
  }

  /**
   * The volume at which the tone will be played.
   * A double values must fall between 0 and 1, where 0 is effectively muted and 1 is the loudest possible value.
   */
  get volume() {
    return this.gainNode.gain.value * GAIN_VOLUME_FACTOR;
  }

  set volume(value: number) {
    this.gainNode.gain.value = value / GAIN_VOLUME_FACTOR;
  }
}

/** Helper function to create an AudioContext */
export function createAudioContext(): AudioContext {
  // @ts-ignore
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  return new AudioContext();
}
