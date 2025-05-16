#!/bin/bash

# Check if imagemagick and librsvg are installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is not installed. Installing..."
    brew install imagemagick
fi

if ! command -v rsvg-convert &> /dev/null; then
    echo "librsvg is not installed. Installing..."
    brew install librsvg
fi

# Verify installations
if ! command -v magick &> /dev/null || ! command -v rsvg-convert &> /dev/null; then
    echo "Failed to install required dependencies. Please install manually:"
    echo "brew install imagemagick librsvg"
    exit 1
fi

convert \
  static/watermelon.svg \
  -background none \
  -define icon:auto-resize=256,128,64,48,32,16 \
  static/favicon.ico

open static/favicon.ico