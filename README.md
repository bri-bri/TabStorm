# TabStorm
Chrome Extension to show a prompt when you have more than 12 tabs open. Tabs will be listed in least-recently used order; can be refreshed or closed on the spot.

## Installation
After cloning this repo, follow the steps below to install the extension.

1. Navigate to Chrome > Settings (Preferences) > Extensions
2. Check the "Developer Mode" check box
3. Load "unpacked" extension > select this repo's directory
4. Activate the extension!

## Editing
If you want to edit, take care when replacing any `css/jquery-ui*.css` files. If you do replace these, make sure to leave the `images` in the root directory and run `. bin/css_fixer.sh` to update image url paths in the css files.

## Behavior
1. After 12 tabs are opened, a prompt will appear in any new tabs
    1. Click the "x" button next to the tab description to close tabs
    2. Click the check to refresh the tab
    3. Once you close the prompt (click the upper-right x or press "Esc"), it won't appear automatically again for 15 minutes.
2. Click the extension icon browser action to show the prompt at any time and refresh the 15 minute waiting period
