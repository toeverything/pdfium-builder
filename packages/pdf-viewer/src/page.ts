import type { Bitmap } from './bitmap.js';
import type { Document } from './document.js';

export class Page {
  constructor(
    public doc: Document,
    public index: number,
    private ptr: number
  ) {}

  get runtime() {
    return this.doc.runtime;
  }

  get pointer() {
    return this.ptr;
  }

  /**
   * Reloads current page.
   */
  reload() {
    if (this.ptr) return;
    this.ptr = this.runtime.loadPage(this.doc.pointer, this.index);
  }

  /**
   * Closes current page.
   */
  close() {
    if (!this.ptr) return;
    this.runtime.closePage(this.ptr);
    this.ptr = 0;
  }

  label() {
    let str = '';

    const len0 = this.runtime.pageLabel(this.doc.pointer, this.index);
    if (!len0) return str;

    const bufferPtr = this.runtime.malloc(len0);
    const len1 = this.runtime.pageLabel(
      this.doc.pointer,
      this.index,
      bufferPtr,
      len0
    );

    if (len0 === len1) {
      str = this.runtime.UTF16ToString(bufferPtr);
    }

    this.runtime.free(bufferPtr);

    return str;
  }

  width() {
    return this.runtime.pageWidth(this.ptr);
  }

  height() {
    return this.runtime.pageHeight(this.ptr);
  }

  rotation() {
    return this.runtime.pageRotation(this.ptr);
  }

  hasTransparency() {
    return !!this.runtime.pageTransparency(this.ptr);
  }

  rect() {
    return { bottom: 0, left: 0, top: this.height(), right: this.width() };
  }

  render(
    bitmap: Bitmap,
    startX: number,
    startY: number,
    sizeX: number,
    sizeY: number,
    rotate: number,
    flags: number
  ) {
    this.runtime.renderPageBitmap(
      bitmap.pointer,
      this.ptr,
      startX,
      startY,
      sizeX,
      sizeY,
      rotate,
      flags
    );
  }

  getPointFromDeviceToPage(deviceX: number, deviceY: number) {
    const startX = 0;
    const startY = 0;
    const sizeX = this.width();
    const sizeY = this.height();
    const rotate = this.rotation();
    const pageXPtr = this.runtime.malloc(4);
    const pageYPtr = this.runtime.malloc(4);

    this.runtime.pointFromDeviceToPage(
      this.ptr,
      startX,
      startY,
      sizeX,
      sizeY,
      rotate,
      deviceX,
      deviceY,
      pageXPtr,
      pageYPtr
    );

    const pageX = this.runtime.getValue(pageXPtr, 'i32');
    const pageY = this.runtime.getValue(pageYPtr, 'i32');

    this.runtime.free(pageXPtr);
    this.runtime.free(pageYPtr);

    return [pageX, pageY];
  }

  getPointFromPageToDevice(pageX: number, pageY: number) {
    const startX = 0;
    const startY = 0;
    const sizeX = this.width();
    const sizeY = this.height();
    const rotate = this.rotation();
    const deviceXPtr = this.runtime.malloc(4);
    const deviceYPtr = this.runtime.malloc(4);

    this.runtime.pointFromPageToDevice(
      this.ptr,
      startX,
      startY,
      sizeX,
      sizeY,
      rotate,
      pageX,
      pageY,
      deviceXPtr,
      deviceYPtr
    );

    const deviceX = this.runtime.getValue(deviceXPtr, 'i32');
    const deviceY = this.runtime.getValue(deviceYPtr, 'i32');

    this.runtime.free(deviceXPtr);
    this.runtime.free(deviceYPtr);

    return [deviceX, deviceY];
  }
}
