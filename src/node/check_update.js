const path = require('path');
const { app, dialog, shell, nativeImage } = require('electron');
const request = require('request');
const compareVersion = require('node-version-compare');
const RELEASE_API_URL = 'https://api.github.com/repos/mesutpiskin/stickycommand/releases/latest';
const REPO_URL = 'https://github.com/mesutpiskin/stickycommand';

module.exports = function () {
  request({
    url: RELEASE_API_URL,
    headers: {
      'User-Agent': 'stickycommand-update-check',
      Accept: 'application/vnd.github+json',
    },
    timeout: 4000,
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        const release = JSON.parse(body);
        const latestVersion = (release.tag_name || '').replace(/^v/i, '');
        if (!latestVersion) return;

        console.log('latest version: ', latestVersion);
        console.log('current version: ', app.getVersion());
        if (compareVersion(app.getVersion(), latestVersion) < 0) {
          const clicked = dialog.showMessageBox({
            title: 'Update',
            message: 'A new version of StickyCommand is available. Open releases page now?',
            buttons: ['Ok', 'Cancel'],
            icon: nativeImage.createFromPath(path.join(__dirname, '../images/dialogIcon.png')),
            defaultId: 0,
          });

          if (clicked === 0) {
            shell.openExternal(`${REPO_URL}/releases`);
          }
        }
      } catch(e) {}
    }
  });
}
