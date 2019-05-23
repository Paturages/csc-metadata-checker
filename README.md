# CSC Metadata Checker

Scans metadata and detects problems in charts made for Clone Hero. Particularly useful to double-check your own folder of charts for broken notes, missing metadata or other discrepancies, or if you happen to be a setlist organizer, do exactly that for your own setlist.

CSC Metadata Checker was, in fact, premiered internally among Custom Songs Central following broken note findings in Marathon Hero. It started as just a broken note scanner, but metadata checking was added prior to Redemption Arc's release. In consequence, Redemption Arc is one setlist on which CSC Metadata Checker was used!

It leverages .chart, .mid and .ini parsers from [chorus](https://github.com/Paturages/chorus), therefore tested on tens of thousands of charts, to gather useful information and deliver it to you, the user.

## Usage instructions

This works pretty much like MIDIFix: drag and drop a folder you wanna scan metadata on, and let it run its thing.

Look out for things that are in red: that usually means stuff has to be fixed.

## Development

### Getting sox

macOS: `brew install sox`, with most likely `lame` installed too
Linux: `sudo apt-get install sox libsox-fmt-mp3` (probably? haven't tested)
Windows: [Get a static build](https://sourceforge.net/projects/sox/files/sox/), as well as a DLL of `libmp3lame`. [This might work](https://www.videohelp.com/software?d=sox-14.4.0-libmad-libmp3lame.zip).

### This repository

Have Node.js installed (at least v10.x.x recommended). Clone the repo, `npm install` dependencies. If you're on Windows, drag and drop a folder on `run.bat`: it will call `index.js`. No fancy toolchain involved.

If you're on Linux/macOS, you might be more familiar with command line: `node index /path/to/folder`. Also works on Windows, if you're a madman and use command line on Windows. I haven't tested drag and drop possibilities on these OSes.

## Build

`npm run build` will drop an .exe in `dist` for Windows. Behind the hood, it leverages [pkg](https://github.com/zeit/pkg): you can most likely build on Linux and macOS by calling `pkg` with the right args.

`compile.bat` does exactly what `npm run build` does. Just an easy double click for myself.

[See here for icon and executable metadata personalization](https://github.com/nwjs/nw.js/wiki/Icons#windows), but you'll most likely have to [go through some hoops](https://github.com/zeit/pkg/issues/91) to get a working executable. I personally resource-edited my copy of the .pkg-cache executable at `C:\Users\Paturages\.pkg-cache\v2.5\fetched-v10.4.1-win-x64`. I guess it could be automated but I won't bother at the moment.

## Suggestions, bugs and ideas

[Feel free to share and submit an issue!](https://github.com/Paturages/csc-metadata-checker/issues)