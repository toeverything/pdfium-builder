set dotenv-load

depot_tools_repo := "https://chromium.googlesource.com/chromium/tools/depot_tools.git"
pdfium_repo := "https://pdfium.googlesource.com/pdfium.git"

pdfium_version := env_var_or_default("PDFIUM_VERSION", "6666")
target_os := env_var("TARGET_OS")
target_cpu := env_var("TARGET_CPU")
debug := env_var_or_default("DEBUG", "false") # release or debug
static_lib := env_var_or_default("STATIC_LIB", "true") # static or shared
enable_v8 := env_var_or_default("ENABLE_V8", "false") # v8
target := if env_var("TARGET_OS") == env_var("TARGET_CPU") { "$TARGET_OS" } else { "$TARGET_OS-$TARGET_CPU" }

args := env_var("PWD") / "args"
dist := env_var("PWD") / "dist"
patches := env_var("PWD") / "patches"
pdfium := env_var("PWD") / "pdfium"

clone_depot_tools:
  [ -d "depot_tools" ] || git clone {{depot_tools_repo}}

clone_pdfium:
  [ -d "pdfium" ] || gclient config --unmanaged {{pdfium_repo}} --custom-var checkout_configuration=minimal
  [ -f ".gclient" ] && echo "target_os = [ '$TARGET_OS' ]" >> .gclient

  gclient sync -r origin/chromium/{{pdfium_version}} --no-history --shallow

build: clone_depot_tools
  #!/usr/bin/env bash
  set -euox pipefail

  export PATH="$PATH:$PWD/depot_tools"
  export DEPOT_TOOLS_WIN_TOOLCHAIN=0

  for folder in pdfium \
    pdfium/build \
    pdfium/third_party/libjpeg_turbo \
    pdfium/base/allocator/partition_allocator; do
    if [ -e "$folder" ]; then
      git -C $folder checkout .
      git -C $folder reset --hard
      git -C $folder clean -df
    fi
  done

  just clone_pdfium

  mkdir -p {{pdfium}}/out/{{target}}

  env=$(
    echo 'target_os = "{{target_os}}"'
    echo 'target_cpu = "{{target_cpu}}"'
    echo 'pdf_is_complete_lib = {{static_lib}}'
    echo 'is_debug = {{debug}}'
    echo 'pdf_enable_v8 = {{enable_v8}}'
    cat {{args}}/common.gn
    if [ "{{debug}}" == "false" ]; then
      cat {{args}}/release.gn
    fi
    if [ -f {{args}}/$TARGET_OS.gn ]; then
      cat {{args}}/$TARGET_OS.gn
    fi
    if [ -f {{args}}/$TARGET_OS.$TARGET_CPU.gn ]; then
      cat {{args}}/$TARGET_OS.$TARGET_CPU.gn
    fi
  )
  args="$(echo $env | sed 's/ = /=/g' | sort)"
  
  [ "{{static_lib}}" == "false" ] && patch -d {{pdfium}} -p1 < {{patches}}/shared.patch

  case "$TARGET_OS" in
  ios)
    patch -d {{pdfium}} -p1 < {{patches}}/ios.patch
    patch -d {{pdfium}}/build -p1 < {{patches}}/ios.build.patch
    ;;
  wasm)
    patch -d {{pdfium}} -p1 < {{patches}}/wasm.patch
    patch -d {{pdfium}}/build -p1 < {{patches}}/wasm.build.patch
    ;;
  win)
    patch -d {{pdfium}}/build -p1 < {{patches}}/win.build.patch
    ;;
  esac

  pushd {{pdfium}}
    gn gen out/{{target}} --args="$args"
    ninja -C out/{{target}} pdfium -v
  popd

pack_base:
  #!/usr/bin/env bash
  set -euox pipefail
  
  mkdir -p {{dist}}
  mkdir -p {{dist}}/lib
  mkdir -p {{dist}}/include
  
  patch -d {{pdfium}} -p1 < {{patches}}/headers.patch
  
  cp -r {{pdfium}}/public/* {{dist}}/include/
  rm -f {{dist}}/include/DEPS
  rm -f {{dist}}/include/README
  rm -f {{dist}}/include/PRESUBMIT.py

[linux]
pack: pack_base
  if "{{static_lib}}" == "true"; then \
    cp {{pdfium}}/out/{{target}}/obj/libpdfium.a {{dist}}/lib; \
  else \
    cp {{pdfium}}/out/{{target}}/libpdfium.so {{dist}}/lib; \
  fi

[macos]
pack: pack_base
  if "{{static_lib}}" == "true"; then \
    cp {{pdfium}}/out/{{target}}/obj/libpdfium.a {{dist}}/lib; \
  else \
    cp {{pdfium}}/out/{{target}}/libpdfium.dylib {{dist}}/lib; \
  fi

[windows]
pack: pack_base
  if "{{static_lib}}" == "true"; then \
    cp {{pdfium}}/out/{{target}}/obj/pdfium.lib {{dist}}/lib; \
  else \
    cp {{pdfium}}/out/{{target}}/pdfium.lib {{dist}}/lib; \
    cp {{pdfium}}/out/{{target}}/pdfium.dll.lib {{dist}}/lib; \
  fi

test:
  echo "test"
