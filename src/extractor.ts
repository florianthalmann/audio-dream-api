import {
  OneShotExtractionClient,
  OneShotExtractionRequest as Request,
  OneShotExtractionResponse as Response,
  OneShotExtractionScheme
} from 'piper-js/one-shot';
import { FeatureList } from 'piper-js/core';
import { toSeconds } from 'piper-js/time';

export interface Value<T> {
  value: T;
}
export interface Beat {
  time: Value<number>;
  label: Value<string>;
}

interface AudioData {
  channels: Float32Array[];
  sampleRate: number;
  duration: number;
}

function bufferToAudioData(buffer: AudioBuffer): AudioData {
  const nChannels = buffer.numberOfChannels;
  const channels = new Array<Float32Array>(nChannels);
  for (let i = 0; i < nChannels; ++i) {
    channels[i] = buffer.getChannelData(i);
  }
  return {
    channels,
    sampleRate: buffer.sampleRate,
    duration: buffer.duration
  };
}

export class Extractor {
  private client: OneShotExtractionClient;

  constructor() {
    this.client = new OneShotExtractionClient(
      null,
      OneShotExtractionScheme.REMOTE
    );
  }

  extract(request: Request): Promise<Response> {
    console.log("EXT")
    return this.client.collect(request)
  }

  extractBeats(buffer: AudioBuffer): Promise<Beat[]> {
    const {channels, sampleRate} = bufferToAudioData(buffer);
    console.log(sampleRate)
    return this.extract({
      audioData: channels,
      audioFormat: {
        sampleRate,
        channelCount: channels.length
      },
      key: 'qm-vamp-plugins:qm-barbeattracker',
      outputId: 'beats'
    }).then(mapFeaturesToBeats);
  }
}

function mapFeaturesToBeats(response: Response): Beat[] {
  // TODO ought to actually validate the shape / type
  const featureData: FeatureList = response.features.collected as FeatureList;
  return featureData.map(feature => ({
    time: {value: toSeconds(feature.timestamp)},
    label: {value: feature.label}
  }));
}