set dotenv-load

depot_tools_repo := "https://chromium.googlesource.com/chromium/tools/depot_tools.git"
pdfium_repo := "https://pdfium.googlesource.com/pdfium.git"
pdfium_branch := env_var_or_default('PDFIUM_BRANCH', "chromium/6694")

dist := "$PWD/dist"
patches := "$PWD/patches"
pdfium := "pdfium"
target := if "$target_os" == "$target_cpu" { "$target_os" } else { "$target_os-$target_cpu" }

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

  for folder in pdfium \
    pdfium/build \
    pdfium/third_party/libjpeg_turbo \
    pdfium/base/allocator/partition_allocator; do
    if [ -e "$folder" ]; then
      git -C $folder reset --hard
      git -C $folder clean -df
    fi
  done

  just clone_pdfium

  mkdir -p {{pdfium}}/out/{{target}}

  env=$(
    cat .env
    [ -f .local.env ] && cat .local.env
    [ -f .$target_os.env ] && cat .$target_os.env
    [ -f .$target_os.$target_cpu.env ] && cat .$target_os.$target_cpu.env
    cat .release.env
  )
  args="$(echo $env | sed 's/ = /=/g' | sort)"

  pushd {{pdfium}}
    case {{target}} in
    ios)
      [ -f {{patches}}/ios.build.patch ] && git apply -v {{patches}}/ios.build.patch
      [ -f {{patches}}/ios.rules.patch ] && git -C build {{patches}}/ios.rules.patch
      ;;
    win)
      [ -f {{patches}}/win.toolchain.patch ] && git -C build apply -v {{patches}}/win.toolchain.patch
      ;;
    esac
    
    gn gen out/{{target}} --args="$args"
    ninja -C out/{{target}} pdfium -v
  popd

test:
  echo 'test'

pack:
  mkdir -p {{dist}}
  mkdir -p {{dist}}/lib
  
  cd {{pdfium}} && git apply -v ../patches/headers.patch
  
  cp -r {{pdfium}}/public {{dist}}/include
  rm -f {{dist}}/include/DEPS
  rm -f {{dist}}/include/README
  rm -f {{dist}}/include/PRESUBMIT.py
  
  ls -la {{pdfium}}/out/{{target}}/obj
  
  [ -f "{{pdfium}}/out/{{target}}/obj/libpdfium.a" ] && cp {{pdfium}}/out/{{target}}/obj/libpdfium.a {{dist}}/lib
  [ -f "{{pdfium}}/out/{{target}}/obj/libpdfium.lib" ] && cp {{pdfium}}/out/{{target}}/obj/libpdfium.lib {{dist}}/lib
