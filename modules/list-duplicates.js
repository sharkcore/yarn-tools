const fs = require("fs");
const lockfile = require("@yarnpkg/lockfile");
const semver = require("semver");
const fixDuplicates = require("./fix-duplicates");

module.exports = (packageJsonData, lockfileData) => {
  const result = [];
  const dedupeCallback = (name, requestedVersion, oldPkg, newPkg) => {
    result.push(
      `Package "${name}" wants ${requestedVersion} and got ${
        oldPkg.version
      }, but could use existing version ${newPkg.version}`
    );
  };

  const lockfileJson = lockfile.parse(lockfileData).object;
  const fixedLockfileJson = lockfile.parse(
    fixDuplicates(packageJsonData, lockfileData, dedupeCallback)
  ).object;

  Object.entries(lockfileJson).forEach(([name, pkg]) => {
    if (!fixedLockfileJson[name]) {
      result.push(
        `Package "${
          name
        }" is extraenous after deduplication, and could be removed.`
      );
    }
  });

  return result;
};
