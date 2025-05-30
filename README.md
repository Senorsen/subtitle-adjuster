# Subtitle Adjuster

A GUI application for adjusting subtitle timings in .ass files. Built with Electron.

## Features

- Adjust subtitle timings for single files or entire folders
- Modern, user-friendly interface
- Drag and drop support
- File/folder selection via buttons
- Real-time feedback on processing status

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage

1. Launch the application
2. Select a subtitle file or folder using one of these methods:
   - Click "Select File" or "Select Folder" buttons
   - Drag and drop a file or folder onto the application window
3. Enter the time adjustment in milliseconds:
   - Positive values delay the subtitles
   - Negative values advance the subtitles
4. Click "Process Subtitles" to apply the changes

## Building

To build the application for your platform:

```bash
npm run build
```

The built application will be available in the `dist` directory.

## License

ISC 
