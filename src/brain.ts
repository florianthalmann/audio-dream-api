import { AudioMemories } from './audio';
import { Analyzer } from './analyzer';
import { Extractor } from './extractor';

export class Brain {

  private analyzer: Analyzer;
  private audioMemories: AudioMemories;
  private fragments = [];

  constructor(audioFolder: string) {
    this.audioMemories = new AudioMemories(audioFolder);
    this.analyzer = new Analyzer();
  }

  getStatus(): string {
    return "pristine";
  }

  async extract() {
    const audio = await this.audioMemories.getMemory('0.wav');
    new Extractor().extractBeats(audio)
      .catch(e => console.log(e));
  }

  async addAudioMemory(audioBlob: Blob) {
    const filename = await this.audioMemories.addMemory(audioBlob);
    new Extractor().extractBeats(await this.audioMemories.getMemory(filename));
  }
}