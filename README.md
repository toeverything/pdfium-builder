## PDFium Builder

PDFium dynamic library and static library builder, inspired by [pdfium-binaries] and [pdfium-lib].

| OS    | CPU   | Toolchain   | Ext   |
| ----- | ----- | ----------- | ------|
| wasm  | wasm  | Emscripten  | .wasm |
| mac   | arm64 |             |       |
| mac   | x64   |             |       |
| linux | arm64 |             |       |
| linux | x64   |             |       |
| win   | arm64 |             |       |
| win   | x64   |             |       |

### Usage

```console
$ just --list

$ just build pack

$ just build-wasm

$ just list-exported-functions | fzf

$ eza -T dist
dist
├── include
│..........
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

[pdfium-binaries]: https://github.com/bblanchon/pdfium-binaries
[pdfium-lib]: https://github.com/paulocoutinhox/pdfium-lib
