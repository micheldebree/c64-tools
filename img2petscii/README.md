# img2petscii

Converts images to Commodore 64 PETSCII

Outputs a [Petmate](https://nurpax.github.io/petmate/) file to enable further
editing.

This is a command line tool aimed at developers and graphic artists.

## Install

There is no need to download `img2petscii`, just do this:

- Make sure [Node.js](https://nodejs.org/) 17 or higher is installed
- `npm install -g img2petscii`

You now have a command called `img2petscii`

## Usage

```bash
Usage: img2petscii [options] <file|folder>

Convert images to PETSCII

Options:
  -V, --version               output the version number
  -o, --output <output name>  set filename or folder for output
  -f, --format <name>         output format (choices: "petmate", "png",
                              default: "petmate")
  -c, --charset <name>        which ROM character set to use (choices:
                              "uppercase", "lowercase", default: "uppercase")
  -m, --method <method>       method for matching PETSCII characters (choices:
                              "slow", "fast", default: "slow")
  -b, --background <method>   method for choosing background color (choices:
                              "optimal", "firstPixel", default: "optimal")
  --loadConfig <filename>     load config from a json file
  --saveConfig <filename>     saves config to a json file
  --overwrite                 force overwrite of existing files
  --mono                      single color mode
  --threshold <value>         threshold (0-255) for --mono mode (default: 128)
  -h, --help                  display help for command
```

### Input

The input name can be a file, or a folder. In case of a folder, all supported
images in that folder will be converted into multiple frames in the resulting
Petmate file, in alphabetical order. Supported extensions are `.png`, `.jpg` and
`.webp`.

Some simple cropping occurs to make the image 320x200 pixels in size.

### Output

```bash
-f, --format <name>
```

- `petmate` creates a Petmate file. In case a folder with multiple images was
  used as input, the images will result in multiple frames in one Petmate file,
  in alphabetical order. This is the default.
- `png` saves as PNG. In case a folder with multiple images was used as input,
  one PNG file per input image is created.

```bash
-o, --output <output name>
```

Optional output filename. If not supplied, `img2petscii` will make one up for
you.

- for `petmate`, this should be a file.
- for `png`, this can be a filename or an (existing) folder name. The folder
  name can be useful because every frame is exported as a separate `png` file.

### Options

```bash
-m, --method <method>
```

Both methods render all the supported characters with a background and
foreground color, and find the best match by minimizing the Euclidian (RGB)
distance with an 8x8 pixel tile in the image.

The `slow` method renders all the characters in all the colors in the palette.

The `fast` method renders all the characters in one color, which it will determine
by first quantizing the tile to the c64 palette, and then selecting the most
occuring color.

```bash
-b, --background <method>
```

The `optimal` method quantizes each image to the c64 palette and selects the most
occuring color as the background color for that frame.

The `firstPixel` method quantizes the _first pixel in the first image_ and uses
that as background color. This is useful for converting multiple images to an
animation, where the `optimal` setting might decide on different background
colors for different frames in the animation. The `firstPixel` option always
uses one background color for the whole animation.

```bash
--mono
--threshold
```

Monochrome mode. First converts input to black and white. Use `--threshold`
to change the quantization threshold. When `--threshold` is not supplied, a
threshold of 128 is used. Using `--method` together with `--mono` has no
effect; the matching method is always `fast`.

```bash
--saveConfig <filename>
--loadConfig <filename>
```

Save configuraton to a JSON file, or load a saved configuration. The
configuration file holds the values supplied on the command line, and default
values. In addition it contains the list of screencodes that are allowed.
Editing this JSON file enables you to limit these screencodes.

### Converting animated GIF

`img2petscii` was written for the Commodore 64 demo "Staying Alive" for
converting animated GIF to PETSCII. You cannot supply an animated GIF directly
to `img2petscii`, but you need to extract the frames of the GIF first. The
process is explained in this [blogpost about "Staying
Alive"](https://www.micheldebree.nl/posts/staying_alive/)
