const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver');

module.exports = (data) => {
    const json = lockfile.parse(data).object;

    const packages={};
    const result = [];
    const re = /^(.*)@([^@]*?)$/;

    Object.entries(json).forEach(([name, package]) => {
        const [_, packageName, requestedVersion] = name.match(re);
        packages[packageName] = packages[packageName] || [];
        packages[packageName].push(Object.assign({}, {
            name,
            package,
            packageName,
            requestedVersion
        }));
    });

    Object.entries(packages).forEach(([name, packages]) => {
        const versions = packages
            .map(p => p.package.version)

        packages.forEach(p => {
            const targetVersion = semver.maxSatisfying(versions, p.requestedVersion);
            if (targetVersion !== p.package.version) {
                result.push(`Package "${name}" wants ${p.requestedVersion} and could get ${targetVersion}, but got ${p.package.version}`);
            }
        })
    });

    return result;
}

