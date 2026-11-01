Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
Name "Duel Vault"
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\Programs\Duel Vault"
InstallDirRegKey HKCU "Software\DuelVault" "InstallDir"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\Duel Vault.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Duel Vault indítása"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Hungarian"
Function .onInit
 SetShellVarContext current
 IfSilent 0 +2
 Sleep 2500
FunctionEnd
Section "Duel Vault"
 SetOutPath "$INSTDIR"
  File /r "${PROJECT_DIR}\release\win-unpacked\*"
 File /oname=duel-vault.ico "${PROJECT_DIR}\assets\icon.ico"
 WriteUninstaller "$INSTDIR\Uninstall.exe"
 CreateDirectory "$SMPROGRAMS\Duel Vault"
 CreateShortcut "$SMPROGRAMS\Duel Vault\Duel Vault.lnk" "$INSTDIR\Duel Vault.exe" "" "$INSTDIR\duel-vault.ico"
 CreateShortcut "$DESKTOP\Duel Vault.lnk" "$INSTDIR\Duel Vault.exe" "" "$INSTDIR\duel-vault.ico"
 WriteRegStr HKCU "Software\DuelVault" "InstallDir" "$INSTDIR"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "DisplayName" "Duel Vault"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "DisplayVersion" "${VERSION}"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "DisplayIcon" "$INSTDIR\duel-vault.ico"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
 WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "NoModify" 1
 WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault" "NoRepair" 1
SectionEnd
Function .onInstSuccess
 IfSilent 0 done
 Exec '"$INSTDIR\Duel Vault.exe"'
 done:
FunctionEnd
Section "Uninstall"
 SetShellVarContext current
 !include "${PROJECT_DIR}\build\uninstall-files.nsh"
 Delete "$INSTDIR\duel-vault.ico"
 Delete "$INSTDIR\Uninstall.exe"
 RMDir "$INSTDIR"
 Delete "$SMPROGRAMS\Duel Vault\Duel Vault.lnk"
 RMDir "$SMPROGRAMS\Duel Vault"
 Delete "$DESKTOP\Duel Vault.lnk"
 DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DuelVault"
 DeleteRegKey HKCU "Software\DuelVault"
 ; The user's collection and backups in APPDATA are deliberately preserved.
SectionEnd
