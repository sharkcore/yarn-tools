const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver');
const fixDuplicates = require('./fix-duplicates');


module.exports = (data) => {
    const result = [];
    const dedupeCallback = (name, requestedVersion, oldPkg, newPkg) => {
        result.push(`Package "${name}" wants ${requestedVersion} and got ${oldPkg.version}, but could use existing version ${newPkg.version}`);
    };

    const fixedLockfile = fixDuplicates(data, dedupeCallback);
    return result;
}

