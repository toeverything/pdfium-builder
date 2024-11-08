/// <reference types="vite/client" />

import { readFile } from 'node:fs/promises';

import wasmURL from '@toeverything/pdfium/wasm?url';
import loremIpsumURL from '@toeverything/resources/lorem-ipsum.pdf?url';

import { assert, expect, test } from 'vitest';

import { createPDFium, Runtime, Viewer } from '../src';

// @vitest-environment happy-dom

test('pdf lorem ipsum', async () => {
  const pdfium = await createPDFium({
    wasmBinary: await readFile(wasmURL.replace(/^\/@fs/, '')),
  });
  const runtime = new Runtime(pdfium);
  const viewer = new Viewer(runtime);

  const bytes = await readFile(loremIpsumURL.replace(/^\/@fs/, ''));

  const doc = viewer.open(bytes);
  assert(doc);

  expect(doc.pageCount()).toBe(3);
  expect(doc.pageMode()).toBe(0);
  expect(doc.version()).toBe(13);

  const metadata = doc.metadata();
  expect(metadata.size).gt(0);

  const page = doc.page(0);
  assert(page);

  expect(page.width()).toBeCloseTo(595, 0.1);
  expect(page.height()).toBeCloseTo(842, 0.1);

  expect(page.size()).toStrictEqual({
    width: page.width(),
    height: page.height(),
  });

  page.close();
  expect(page.pointer).toBe(0);

  expect(page.width()).toBe(0);
  expect(page.height()).toBe(0);

  expect(page.rotation()).toBe(-1);
  expect(page.hasTransparency()).toBe(false);

  page.reload();
  expect(page.pointer).gt(0);

  expect(page.width()).toBeCloseTo(595, 0.1);
  expect(page.height()).toBeCloseTo(842, 0.1);

  expect(page.size()).toStrictEqual({
    width: page.width(),
    height: page.height(),
  });

  expect(page.rotation()).toBe(0);
  expect(page.hasTransparency()).toBe(false);

  page.close();
  expect(page.pointer).toBe(0);

  doc.close();
  expect(doc.pointer).toBe(0);

  viewer.dispose();
});
