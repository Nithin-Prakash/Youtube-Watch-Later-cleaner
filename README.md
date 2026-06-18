# Youtube Watch Later cleaner

A Chrome-compatible Manifest V3 extension that helps you manage and clean up your YouTube Watch Later playlist. Remove all videos, remove a selected set of videos, and stop the cleanup process at any time.

## Features

- Remove all videos from your currently loaded Watch Later playlist.
- Remove only selected videos from the playlist.
- Stop an in-progress cleanup operation at any time.
- View live progress and status while videos are being removed.
- Works directly on the YouTube Watch Later page.
- No account registration required.

## Supported Browsers

This extension works with Chromium-based browsers that support Manifest V3, including:

- Google Chrome
- Brave
- Other Chromium-based browsers

## Installation

### Chrome Web Store

Install directly from the Chrome Web Store (link to be added after publication).

### Manual Installation

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder

## Usage

### Remove All Videos

1. Open your YouTube Watch Later playlist:
   `https://www.youtube.com/playlist?list=WL`
2. Click the extension icon or use the floating page control.
3. Select **Clear All**.
4. Keep the playlist tab open while the cleanup runs.
5. Monitor progress in the popup or floating control panel.

### Stop an Active Cleanup

1. Open the extension popup or floating panel.
2. Click **Stop**.
3. The extension will stop after the current removal action completes.

### Remove Selected Videos Only

1. Open your YouTube Watch Later playlist.
2. Click **Select Videos**.
3. Choose the videos you want to remove.
4. Click **Remove selected**.
5. The extension will remove only the chosen videos.

## How It Works

YouTube does not provide a browser-side feature for bulk removal of Watch Later videos.

Watch Later Cleaner performs the same actions that a user would normally perform manually through the YouTube interface. The extension interacts with page controls to remove videos from the currently loaded Watch Later playlist based on the actions initiated by the user.

No changes are made unless the user explicitly starts a cleanup operation.

## Permissions

### activeTab

Required to interact with the currently open YouTube Watch Later page after the user initiates an action.

### scripting

Required to execute extension functionality on the Watch Later page.

### storage

Required to save extension settings and maintain cleanup status information.

### Host Permissions

`https://www.youtube.com/*`

Required because the extension operates only on YouTube pages and needs access to the Watch Later playlist interface.

## Privacy

Watch Later Cleaner does not collect, store, transmit, sell, or share personal information.

The extension:

- Does not collect account information.
- Does not collect browsing history.
- Does not send data to external servers.
- Does not use analytics or tracking services.
- Does not execute remotely hosted code.

All functionality runs locally within the user's browser.

Any settings stored by the extension remain on the user's device and are never transmitted externally.

## Data Usage

The extension processes information only within the active YouTube Watch Later page to perform actions requested by the user.

No playlist information is transmitted outside the browser.

## Disclaimer

Watch Later Cleaner is an independent browser extension designed to help users manage their YouTube Watch Later playlist.

This extension is not affiliated with, endorsed by, sponsored by, or associated with YouTube, Google, or any of their affiliates.

YouTube is a trademark of Google LLC.

The extension performs actions only when explicitly initiated by the user and operates solely within the user’s browser session.

Users are responsible for reviewing their playlist before removing videos. Removed videos may not be recoverable through this extension once the action has been completed.

## Support

For questions, feedback, or bug reports:

**Nithin Prakash**

Email: iamnithinprakash@gmail.com

GitHub Repository:
https://github.com/Nithin-Prakash/Youtube-Watch-Later-cleaner