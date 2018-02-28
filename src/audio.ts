import * as fs from 'fs';
import * as wav from 'wav';
import * as decode from 'audio-decode';

export class AudioMemories {
  private fileCount = 0;
  private liveMemory = {};

  constructor(private audioFolder: string) {}

  async addMemory(audioBlob: Blob): Promise<string> {
    const filename = this.store(audioBlob);
    await this.load(filename);
    return filename;
  }

  getMemory(filename: string): Promise<AudioBuffer> {
    if (!this.liveMemory[filename]) {
      this.load(filename);
    }
    return decode(fs.readFileSync(this.audioFolder+filename));
  }

  private store(audioBlob: Blob): string {
    var filename = this.fileCount.toString()+'.wav';
    this.fileCount++;
    var writer = new wav.FileWriter(this.audioFolder+filename);
    writer.write(audioBlob);
    writer.end();
    return filename;
  }

  private load(filename: string): Promise<any> {
    this.liveMemory[filename] = {};
    var file = fs.createReadStream(this.audioFolder+filename);
    var data = []; // array that collects all the chunks
    var reader = new wav.Reader();
    reader.on('format', format => {
      this.liveMemory[filename]['format'] = format;
    });
    reader.on('data', chunk => {
      data.push(chunk);
    });
    return new Promise((resolve, reject) => {
      reader.on('error', reject);
      reader.on('end', () => {
        this.liveMemory[filename]['data'] = Buffer.concat(data);
        resolve();
      });
      file.pipe(reader);
    })
  }

}