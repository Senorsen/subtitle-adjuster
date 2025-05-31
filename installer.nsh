!macro customInstall
  # File associations for .ass files
  WriteRegStr HKCR ".ass" "" "SubtitleAdjuster.ass"
  WriteRegStr HKCR "SubtitleAdjuster.ass" "" "SubRip Subtitle"
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles" "AppliesTo" ".ass"
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "SubtitleAdjuster.ass\shell\AdjustSubtitles" "HasLUAShield" ""

  # File associations for .srt files
  WriteRegStr HKCR ".srt" "" "SubtitleAdjuster.srt"
  WriteRegStr HKCR "SubtitleAdjuster.srt" "" "SubRip Subtitle"
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles" "AppliesTo" ".srt"
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "SubtitleAdjuster.srt\shell\AdjustSubtitles" "HasLUAShield" ""

  # Folder context menu
  WriteRegStr HKCR "Directory\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "Directory\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "Directory\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "Directory\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "Directory\shell\AdjustSubtitles" "HasLUAShield" ""

  # Windows 11 modern context menu
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles" "AppliesTo" ".ass"
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles" "HasLUAShield" ""

  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles" "AppliesTo" ".srt"
  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles" "HasLUAShield" ""

  WriteRegStr HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles" "" "Adjust Subtitles"
  WriteRegStr HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles" "Position" "top"
  WriteRegStr HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles" "HasLUAShield" ""

  # Notify Windows of the changes
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  # Remove file associations
  DeleteRegKey HKCR ".ass"
  DeleteRegKey HKCR "SubtitleAdjuster.ass"
  DeleteRegKey HKCR ".srt"
  DeleteRegKey HKCR "SubtitleAdjuster.srt"
  DeleteRegKey HKCR "Directory\shell\AdjustSubtitles"

  # Remove Windows 11 modern context menu entries
  DeleteRegKey HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles"
  DeleteRegKey HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles"
  DeleteRegKey HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles"

  # Notify Windows of the changes
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend 
