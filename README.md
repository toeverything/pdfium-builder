PDFium Builder
--------------

PDFium dynamic library and static library builder, inspired by [pdfium-binaries] and [pdfium-lib].

[pdfium-binaries]: https://github.com/bblanchon/pdfium-binaries 
[pdfium-lib]: https://github.com/paulocoutinhox/pdfium-lib

### Usage

```console
$ just --list

$ just build pack

$ just build-wasm

$ eza -T dist
dist
├── include
│  ├── cpp
│  │  ├── fpdf_deleters.h
│  │  └── fpdf_scopers.h
│  ├── fpdf_annot.h
│  ├── fpdf_attachment.h
│  ├── fpdf_catalog.h
│  ├── fpdf_dataavail.h
│  ├── fpdf_doc.h
│  ├── fpdf_edit.h
│  ├── fpdf_ext.h
│  ├── fpdf_flatten.h
│  ├── fpdf_formfill.h
│  ├── fpdf_fwlevent.h
│  ├── fpdf_javascript.h
│  ├── fpdf_ppo.h
│  ├── fpdf_progressive.h
│  ├── fpdf_save.h
│  ├── fpdf_searchex.h
│  ├── fpdf_signature.h
│  ├── fpdf_structtree.h
│  ├── fpdf_sysfontinfo.h
│  ├── fpdf_text.h
│  ├── fpdf_thumbnail.h
│  ├── fpdf_transformpage.h
│  └── fpdfview.h
├── lib
│  └── libpdfium.a
├── pdfium.js
└── pdfium.wasm
```

### Local Build

Creates a `.env` file

```console
$ cat .env
TARGET_OS = "mac"
TARGET_CPU = "arm64"
STATIC_LIB = true
DEBUG = false
PDFIUM_VERSION = "6666"
```
