const path = require('path');
const fs = require('node:fs');

exports.default = function (context) {
  const outDir = path.join(context.appOutDir, 'locales');
  const filesToDelete = fs
    .readdirSync(outDir)
    .filter((file) => file !== 'en-US.pak')
    .map((file) => path.join(outDir, file));

  filesToDelete.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
};
