#!/usr/bin/env bash

# Clean
rm nohup.out 2>/dev/null
rm -rf public
mkdir public

# Compile TypeScript sources
nohup watchify -d src/scripts/main.ts -p [ tsify ] -o public/main.js &
watchify_pid=$!
trap "kill -15 $watchify_pid $>/dev/null" 2 15

# Compile Pug sources
nohup pug src/templates -o public -w &
pug_pid=$!
trap "kill -15 $pug_pid &>/dev/null" 2 15

# Compile SCSS sources
nohup node-sass src/styles/main.scss public/main.css -w  --output-style expanded &
sass_pid=$!
trap "kill -15 $sass_pid &>/dev/null" 2 15

# Run Server
nohup browser-sync start --config bs-config.js &
browserSync_pid=$!
trap "kill -15 $browserSync_pid &>/dev/null" 2 15

tail -f nohup.out
