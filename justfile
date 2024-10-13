set dotenv-load

depot_tools_repo := "https://chromium.googlesource.com/chromium/tools/depot_tools.git"
pdfium_repo := "https://pdfium.googlesource.com/pdfium.git"
pdfium_branch := env_var_or_default('PDFIUM_BRANCH', "chromium/6694")

patches_dir := "$PWD/patches"
pdfium_dir := "pdfium"
target := "$target_os"

clone_depot_tools:
  [ -d "depot_tools" ] || git clone {{depot_tools_repo}}

clone_pdfium:
  [ -d "pdfium" ] || gclient config --unmanaged {{pdfium_repo}} --custom-var checkout_configuration=minimal
  [ -f ".gclient" ] && echo "target_os = [ '$target_os' ]" >> .gclient

  gclient sync -r origin/{{pdfium_branch}} --no-history --shallow

build: clone_depot_tools
  #!/usr/bin/env bash
  set -euo pipefail

  export PATH="$PATH:$PWD/depot_tools"

  export DEPOT_TOOLS_WIN_TOOLCHAIN=0

  just clone_pdfium

  for folder in pdfium \
    pdfium/build \
    pdfium/third_party/libjpeg_turbo \
    pdfium/base/allocator/partition_allocator; do
    if [ -e "$folder" ]; then
      git -C $folder reset --hard
      git -C $folder clean -df
    fi
  done


  mkdir -p {{pdfium_dir}}/out/{{target}}

  env=$(
    cat .env
    [ -f .$target_os.env ] && cat .$target_os.env
    [ -f .$target_os.$target_cpu.env ] && cat .$target_os.$target_cpu.env
    cat .release.env
  )
  args="$(echo $env | sed 's/ = /=/g' | sort)"

  pushd {{pdfium_dir}}
    case {{target}} in
    ios)
        [ -f {{patches_dir}}/ios.build.patch ] && git apply -v {{patches_dir}}/patches/ios.build.patch
        [ -f {{patches_dir}}/ios.rules.patch ] && git -C build {{patches_dir}}/patches/ios.rules.patch
        ;;
    win)
        [ -f {{patches_dir}}/win.toolchain.patch ] && git -C build apply -v {{patches_dir}}/win.toolchain.patch
        ;;
    esac
    
    gn gen out/{{target}} --args="$args"
    ninja -C out/{{target}} pdfium -v
  popd

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
