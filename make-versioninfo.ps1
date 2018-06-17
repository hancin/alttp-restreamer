$major,$minor,$patch = $env:APPVEYOR_BUILD_VERSION.split('.')

$versionInfo = @"
1 VERSIONINFO
FILEVERSION $major,$minor,$patch,0
PRODUCTVERSION $major,$minor,$patch,0
FILEOS 0x40004
FILETYPE 0x1
{
BLOCK "StringFileInfo"
{
    BLOCK "040904b0"
    {
        VALUE "FileDescription", "ALTTP Restreamer Dashboard"
        VALUE "FileVersion", "$env:APPVEYOR_BUILD_VERSION"
        VALUE "InternalName", "alttprestreamer"
        VALUE "LegalCopyright", "Copyright (c) 2017-$(Get-Date -Format yyyy) Hancin"
        VALUE "OriginalFilename", "dashboard.exe"
        VALUE "ProductName", "ALTTP Restreamer Dashboard"
        VALUE "ProductVersion", "$env:APPVEYOR_BUILD_VERSION-$(-join $env:APPVEYOR_REPO_COMMIT[0..7])"
    }
}

BLOCK "VarFileInfo"
{
	VALUE "Translation", 0x0409 0x04B0  
}
}
"@

$versionInfo | Out-File ./version-info.rc