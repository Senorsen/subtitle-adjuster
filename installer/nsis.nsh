!macro customInstall
  # Check if we have admin privileges (system-wide installation)
  UserInfo::GetAccountType
  Pop $0
  ${If} $0 == "Admin"
    # System-wide installation - use HKCR
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
  ${Else}
    # Per-user installation - use HKCU
    # File associations for .ass files
    WriteRegStr HKCU "Software\Classes\.ass" "" "SubtitleAdjuster.ass"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass" "" "SubRip Subtitle"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles" "AppliesTo" ".ass"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.ass\shell\AdjustSubtitles" "HasLUAShield" ""

    # File associations for .srt files
    WriteRegStr HKCU "Software\Classes\.srt" "" "SubtitleAdjuster.srt"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt" "" "SubRip Subtitle"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles" "AppliesTo" ".srt"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\SubtitleAdjuster.srt\shell\AdjustSubtitles" "HasLUAShield" ""

    # Folder context menu
    WriteRegStr HKCU "Software\Classes\Directory\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\Directory\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\Directory\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\Directory\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\Directory\shell\AdjustSubtitles" "HasLUAShield" ""

    # Windows 11 modern context menu
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles" "AppliesTo" ".ass"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles" "HasLUAShield" ""

    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles" "AppliesTo" ".srt"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles" "HasLUAShield" ""

    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles" "" "Adjust Subtitles"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles" "Position" "top"
    WriteRegStr HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles" "HasLUAShield" ""
  ${EndIf}

  # Notify Windows of the changes
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  # Check if we have admin privileges
  UserInfo::GetAccountType
  Pop $0
  ${If} $0 == "Admin"
    # Remove system-wide registry entries
    DeleteRegKey HKCR ".ass"
    DeleteRegKey HKCR "SubtitleAdjuster.ass"
    DeleteRegKey HKCR ".srt"
    DeleteRegKey HKCR "SubtitleAdjuster.srt"
    DeleteRegKey HKCR "Directory\shell\AdjustSubtitles"
    DeleteRegKey HKCR "SystemFileAssociations\.ass\shell\AdjustSubtitles"
    DeleteRegKey HKCR "SystemFileAssociations\.srt\shell\AdjustSubtitles"
    DeleteRegKey HKCR "SystemFileAssociations\Directory\shell\AdjustSubtitles"
  ${Else}
    # Remove per-user registry entries
    DeleteRegKey HKCU "Software\Classes\.ass"
    DeleteRegKey HKCU "Software\Classes\SubtitleAdjuster.ass"
    DeleteRegKey HKCU "Software\Classes\.srt"
    DeleteRegKey HKCU "Software\Classes\SubtitleAdjuster.srt"
    DeleteRegKey HKCU "Software\Classes\Directory\shell\AdjustSubtitles"
    DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.ass\shell\AdjustSubtitles"
    DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.srt\shell\AdjustSubtitles"
    DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\Directory\shell\AdjustSubtitles"
  ${EndIf}

  # Notify Windows of the changes
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend 
