# Download Files Setup

This directory contains the download files for your products.

## Current Status

**✅ Testing Mode**: Placeholder `.txt` files are currently in place for testing the download functionality.

## How to Add Your Real Installers

### For Gecko Chatbot

Replace these placeholder files:
- `gecko/gecko-chatbot-setup.exe.txt` → `gecko/gecko-chatbot-setup.exe`
- `gecko/gecko-chatbot.dmg.txt` → `gecko/gecko-chatbot.dmg`
- `gecko/gecko-chatbot.AppImage.txt` → `gecko/gecko-chatbot.AppImage`

### For PhishGuard

Replace these placeholder files:
- `phishguard/phishguard-setup.exe.txt` → `phishguard/phishguard-setup.exe`
- `phishguard/phishguard.dmg.txt` → `phishguard/phishguard.dmg`
- `phishguard/phishguard.AppImage.txt` → `phishguard/phishguard.AppImage`

## After Replacing Files

Once you've added your real installer files, update the file extensions in these files:

1. **config/site.ts** - Update the `downloads` object for each product
2. **pages/products/gecko-chatbot.tsx** - Update the `downloads` object
3. **pages/products/phishguard.tsx** - Update the `downloads` object

Change `.txt` extensions back to the actual file extensions:
- `.exe.txt` → `.exe`
- `.dmg.txt` → `.dmg`
- `.AppImage.txt` → `.AppImage`

## Git Considerations

⚠️ **Important**: Large binary files should not be committed to Git.

Consider these alternatives:
- Use **Git LFS** (Large File Storage)
- Host files on a **CDN** (AWS S3, Cloudflare R2, etc.)
- Use **GitHub Releases** to host installer files
- Keep files locally and deploy separately

## File Size Recommendations

- Windows EXE: Typically 50-200 MB
- macOS DMG: Typically 50-150 MB
- Linux AppImage: Typically 50-150 MB

Make sure your hosting solution can handle these file sizes efficiently.
