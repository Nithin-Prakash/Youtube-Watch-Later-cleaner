# Youtube Watch Later cleaner

A Chrome-compatible Manifest V3 extension for cleaning up the currently loaded YouTube Watch Later playlist.

## Capabilities

- Remove every video from the loaded Watch Later playlist.
- Stop an in-progress removal run from the popup or floating page panel.
- Select individual videos on the playlist page and remove only those videos.
- Reopen the popup while removal is running and see the current live status.
- Use a bundled local icon set with a polished **WL** mark.
- Run entirely from local bundled extension files, with no remotely hosted logic or behavior code.

## Install

1. Open `chrome://extensions` in Chrome, Brave, Edge, Vivaldi, or another Chromium-based browser.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder.

If Chrome still shows an old icon after updating an unpacked install, remove the old unpacked extension from `chrome://extensions` and load this folder again. Chrome can cache extension icons between reloads.

## Use

1. Open YouTube Watch Later: `https://www.youtube.com/playlist?list=WL`.
2. Click the floating **Clear all** button on the page, or click the extension icon and choose **Clear all**.
3. Keep the tab open while the cleaner removes items.
4. To cancel while it is running, click **Stop** in the floating page panel or in the extension popup. The cleaner stops after the current video action finishes.

## Remove Only Selected Videos

1. Open YouTube Watch Later: `https://www.youtube.com/playlist?list=WL`.
2. Click **Select videos** in the floating panel, or **Select videos on page** in the popup.
3. Tick the videos you want to remove.
4. Click **Remove selected**.

## Privacy and code-loading notes

- The extension uses Manifest V3.
- All extension behavior is in local files bundled in this folder.
- It does not load or execute remotely hosted JavaScript.
- It does not send your playlist data to any server.
- Selected videos are tracked only in the active YouTube page while the extension is running.

## How it works

YouTube does not expose a public browser-side API for clearing Watch Later. This extension automates the same page controls a user would normally click: it opens each video's action menu and clicks **Remove from Watch later**. For selected-video removal, it only performs that action for the videos you selected.

## Contact

For questions, feedback, or bug reports, contact:

- Name: Nithin Prakash
- Email: iamnithinprakash@gmail.com
- GitHub: https://github.com/Nithin-Prakash/Youtube-Watch-Later-cleaner/