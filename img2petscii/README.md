# img2petscii

Converts images to Commodore 64 PETSCII

Outputs a [Petmate](https://nurpax.github.io/petmate/) file to enable further
editing.

This is a command line tool aimed at developers and graphic artists.

## Install

- Make sure [Node.js](https://nodejs.org/) 17 or higher is installed
- `npm install img2petscii`

## Usage

```
Usage: img2petscii [options] <image file|folder>

Convert images to PETSCII

Options:
  -V, --version              output the version number
  -m, --method <method>      method for matching PETSCII characters (choices:
                             "slow", "fast", default: "slow")
  -b, --background <method>  method for choosing background color (choices:
                             "optimal", "firstPixel", default: "optimal")
  --loadConfig <filename>    load config from a json file
  --saveConfig <filename>    saves config to a json file
  -h, --help                 display help for command
```

### Input

The input name can be a file, or a folder. In case of a folder, all supported
images in that folder will be converted into multiple frames in the resulting
Petmate file. Supported extensions are `.png`, `.jpg` and `.webp`.

Some simple cropping occurs to make the image 320x200 pixels in size.

### Output

The output is a Petmate file with the input name with `.petmate` appended as
an extension. In case a folder with multiple images was used as input, the
images will result in multiple frames in the Petmate file, in alphabetical
order.

### Options

    -m, --method <method>

Both methods render all the supported characters with a background and
foreground color, and find the best match by minimizing the Euclidian (RGB)
distance with an 8x8 pixel tile in the image.

The `slow` method renders all the characters in all the colors in the palette.

The `fast` method renders all the characters in one color, which it will determine
by first quantizing the tile to the c64 palette, and then selecting the most
occuring color.

    -b, --background <method>

The `optimal` method quantizes each image to the c64 palette and selects the most
occuring color as the background color for that frame.

The `firstPixel` method quantizes the _first pixel in the first image_ and uses
that as background color. This is useful for converting multiple images to an
animation, where the `optimal` setting might decide on different background
colors for different frames in the animation. The `firstPixel` option always
uses one background color for the whole animation.

    --saveConfig <filename>
    --loadConfig <filename>

Save configuraton to a JSON file, or load a save configuration. The
configuration file holds the values supplied on the command line, and default
values. In addition it contains the list of screencodes that are allowed.
Editing this JSON file enables you to limit these screencodes.
