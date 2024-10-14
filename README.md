PDFium Builder
--------------

PDFium dynamic library and static library builder, inspired by [pdfium-binaries] and [pdfium-lib].

[pdfium-binaries]: https://github.com/bblanchon/pdfium-binaries 
[pdfium-lib]: https://github.com/paulocoutinhox/pdfium-lib

### Local Build

Creates an `.env` file

```console
$ cat .env
TARGET_OS = "mac"
TARGET_CPU = "arm64"
STATIC_LIB = true
DEBUG = false
PDFIUM_VERSION = "6666"
```
