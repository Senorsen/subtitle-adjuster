# Subtitle Adjuster

A GUI application for adjusting subtitle timings in .ass and .srt files. Built with Electron.

This project was mostly written by AI to achieve some personal adhoc needs - it works after several tweaks and debugging.

## Features

- Adjust subtitle timings for single files or entire folders
- Modern, user-friendly interface
- Drag and drop support
- File/folder selection via buttons
- Real-time feedback on processing status
- Windows context menu integration
- Support for both classic and modern Windows 11 context menus

## Installation
Download the latest release from the Releases page and run the installer executable.

### De-quarantining on macOS
After installing the application, you may need to remove the quarantine attribute that macOS applies to downloaded applications. To do this, open Terminal and run:

```bash
xattr -d com.apple.quarantine /Applications/Subtitle\ Adjuster.app
```

This will allow the application to run without the security warning.

## Usage

1. Launch the application
2. Select a subtitle file or folder using one of these methods:
   - Click "Select File" or "Select Folder" buttons
   - Drag and drop a file or folder onto the application window
   - Right-click on .ass or .srt subtitle file(s) or folder and select "Adjust Subtitles"
3. Enter the time adjustment in milliseconds:
   - Positive values delay the subtitles
   - Negative values advance the subtitles
4. Click "Process Subtitles" to apply the changes

## Building

### Prepare

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start

### Windows
To build the application for Windows installer (NSIS):

```bash
npm run build
```

The built installer will be available in the `dist` directory.

### macOS
To build the application for macOS:

```bash
npm run build:mac
```

The built application will be available in the `dist` directory as a `.dmg` file.

Note: macOS builds can only be created on a macOS system due to Apple's code signing requirements.

## Development

To start the application in development mode:

```bash
npm start
```

To convert the SVG icon to ICO format (Windows only):

```bash
npm run ico
```

## License

MIT License - see the [LICENSE](LICENSE) file for details. 
