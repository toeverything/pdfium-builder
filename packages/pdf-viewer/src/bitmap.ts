import { BitmapFormat, BYTES_PER_PIXEL } from '@toeverything/pdf-viewer-types';
import type { Runtime } from './runtime';

export class Bitmap {
  static format = BitmapFormat.BGRA;

  constructor(
    public runtime: Runtime,
    public ptr: number,
    public format = Bitmap.format
  ) {}

  get pointer() {
    return this.ptr;
  }

  close() {
    this.runtime.closeBitmap(this.ptr);
    this.runtime.free(this.ptr);
  }

  fill(
    left: number,
    top: number,
    width: number,
    height: number,
    color = 0xffffffff //32 bit
  ) {
    return this.runtime.fillBitmap(this.ptr, left, top, width, height, color);
  }

  toBytes() {
    const stride = this.runtime.bitmapStride(this.ptr);
    const height = this.runtime.bitmapHeight(this.ptr);
    const bufferPtr = this.runtime.bitmapBuffer(this.ptr);

    return this.runtime.HEAPU8.subarray(
      bufferPtr,
      stride * height * BYTES_PER_PIXEL
    );
  }
}
