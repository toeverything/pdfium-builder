set dotenv-load

PATH_FILE := x'${GITHUB_PATH:-.path}'
DEPOT_TOOLS_PATH := "${PWD}/depot_tools"
depot_tools_url := "https://chromium.googlesource.com/chromium/tools/depot_tools.git"

clone_depot_tools:
  [ -d "depot_tools" ] || git clone {{depot_tools_url}} depot_tools
  echo "$PWD/depot_tools" >> {{PATH_FILE}}

fetch: clone_depot_tools
  
build:
  @echo "$TARGET_OS $TARGET_CPU"

patch:
  echo 'path'

test:
  echo 'test'


# https://doc.rust-lang.org/nightly/rustc/platform-support.html
#
# linux
# arm   arm-unknown-linux-gnueabi
# arm   arm-unknown-linux-gnueabihf
# arm   armv7-unknown-linux-gnueabihf
#
# arm   i686-unknown-linux-gnu #32
#
# arm64 aarch64-unknown-linux-gnu   T1
# arm64 aarch64-unknown-linux-musl  T1
# x64   x86_64-unknown-linux-gnu    T1
# arm64 x86_64-unknown-linux-musl   T1
#
# mac
# arm64 aarch64-apple-darwin        T1
# x64   x86_64-apple-darwin         T1
#
# win
# arm   i686-pc-windows-gnu   #32
# arm   i686-pc-windows-msvc  #32
# arm64 aarch64-pc-windows-gnu
# arm64 aarch64-pc-windows-msvc
# x64   x86_64-pc-windows-gnu
# x64   x86_64-pc-windows-msvc
#
# ios
# arm64 aarch64-apple-ios           T1
#
# android
# arm64 aarch64-linux-android       T1
