import {
  type FileIdentifier,
  type MetaTag,
  type Metadata,
  MetaTags,
} from '@toeverything/pdf-viewer-types';

import type { Runtime } from './runtime';
import { Page } from './page';

export class Document {
  #version = 0;

  constructor(
    public runtime: Runtime,
    private ptr: number
  ) {}

  get pointer() {
    return this.ptr;
  }

  /**
   * Closes current document.
   */
  close() {
    if (!this.ptr) return;
    this.runtime.closeDocument(this.ptr);
    this.ptr = 0;
  }

  /**
   * Gets PDF version.
   */
  version() {
    if (this.#version) return this.#version;

    const bufferPtr = this.runtime.malloc(4);
    const len = this.runtime.version(this.ptr, bufferPtr);
    if (len) {
      this.#version = this.runtime.getValue(bufferPtr, 'i32');
    }
    this.runtime.free(bufferPtr);

    return this.#version;
  }

  /**
   * Gets file identifier by id.
   */
  fileIdentifier(idType: FileIdentifier) {
    let str = '';

    const len0 = this.runtime.fileIdentifier(this.ptr, idType);
    if (!len0) return str;

    const bufferPtr = this.runtime.malloc(len0);
    const len1 = this.runtime.fileIdentifier(this.ptr, idType, bufferPtr, len0);
    if (len0 !== len1) {
      this.runtime.free(bufferPtr);
      return str;
    }

    str = this.runtime.UTF16ToString(bufferPtr, len1);

    this.runtime.free(bufferPtr);

    return str;
  }

  /**
   * Gets metadata.
   */
  metadata(): Metadata {
    const arr = MetaTags.map(key => {
      const tagPtr = this.runtime.stringToNewUTF8(key);
      if (!tagPtr) return { meta: [key, ''], ptrs: [tagPtr, 0] };

      const len0 = this.runtime.metaText(this.ptr, tagPtr);
      if (!len0) return { meta: [key, ''], ptrs: [tagPtr, 0] };

      const bufferPtr = this.runtime.malloc(len0);
      const len1 = this.runtime.metaText(this.ptr, tagPtr, bufferPtr, len0);
      if (len0 !== len1) return { meta: [key, ''], ptrs: [tagPtr, bufferPtr] };

      const value = this.runtime.UTF16ToString(bufferPtr, len1);
      return { meta: [key, value], ptrs: [tagPtr, bufferPtr] };
    }).map(({ meta, ptrs: [tagPtr, bufferPtr] }) => {
      tagPtr && this.runtime.free(tagPtr);
      bufferPtr && this.runtime.free(bufferPtr);
      return meta;
    }) as [MetaTag, string][];

    return new Map(arr);
  }

  /**
   * Gets this document's page mode.
   */
  pageMode() {
    return this.runtime.pageMode(this.ptr);
  }

  /**
   * Gets total number of pages in the document.
   */
  pageCount() {
    return this.runtime.pageCount(this.ptr);
  }

  /**
   * Gets a page by index.
   */
  page(at: number) {
    const pagePtr = this.runtime.loadPage(this.ptr, at);

    if (!pagePtr) {
      console.error(`Page ${at} not found`);
      return;
    }

    return new Page(this, at, pagePtr);
  }
}
