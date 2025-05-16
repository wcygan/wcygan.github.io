# How do I create a favicon?

The [gen-favicon.sh](../scripts/gen-favicon.sh) script automates the process of creating a favicon from an SVG file. Here's how it works:

1. **Dependency Check**: The script first checks if required tools are installed:
   - ImageMagick (`magick`) for image conversion
   - librsvg (`rsvg-convert`) for SVG processing
   If either is missing, it attempts to install them using Homebrew.

2. **Conversion Process**: Using ImageMagick's `convert` command, it:
   - Takes the source SVG file (`static/watermelon.svg`)
   - Sets a transparent background (`-background none`)
   - Automatically generates multiple icon sizes (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
   - Outputs a single `.ico` file containing all sizes (`static/favicon.ico`)

3. **Preview**: Finally, it opens the generated favicon for preview.

To use the script:

```bash
./scripts/gen-favicon.sh
```

This will:

1. Check for dependencies
2. Install missing dependencies if needed
3. Convert the SVG to a favicon
4. Open the favicon for preview

If you don't have Homebrew installed, you can install it from [here](https://brew.sh/).
