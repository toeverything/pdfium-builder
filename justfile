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
