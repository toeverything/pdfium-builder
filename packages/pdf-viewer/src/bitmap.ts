import { BitmapFormat } from '@toeverything/pdf-viewer-types';
import type { Runtime } from './runtime';

export class Bitmap {
  constructor(
    public runtime: Runtime,
    public ptr: number,
    public format = BitmapFormat.BGRA
  ) {}

  empty(width: number, height: number, firstScan: number, stride: number) {
    return this.runtime.createEmptyBitmap(
      width,
      height,
      this.format,
      firstScan,
      stride
    );
  }
}
