const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver');


module.exports = (data, dedupeCallback) => {
    const json = lockfile.parse(data).object;

    const packages={};
    const result = [];
    const re = /^(.*)@([^@]*?)$/;

    Object.entries(json).forEach(([name, pkg]) => {
        const [_, packageName, requestedVersion] = name.match(re);
        packages[packageName] = packages[packageName] || [];
        packages[packageName].push(Object.assign({}, {
            name,
            pkg,
            packageName,
            requestedVersion
        }));
    });

    Object.entries(packages).forEach(([name, packages]) => {
        // reverse sort, so we'll find the maximum satisfying version first
        const versions = packages
            .map(p => p.pkg.version)
            .sort(semver.rcompare);
        const ranges = packages.map(p => p.requestedVersion);

        const singleVersion = versions.find(version =>
          ranges.every(range => semver.satisfies(version, range))
        );

        if (singleVersion) {
          // if all ranges can be satisfied by a single version, dedup to that
          const dedupedPackage = packages.find( p => p.pkg.version === singleVersion);
          packages.forEach(p => {
              const key = `${name}@${p.requestedVersion}`;
              const newPkg = dedupedPackage.pkg;
              const oldPkg = json[key];
              if (newPkg !== oldPkg) {
                  json[key] = newPkg;
                  if (dedupeCallback) {
                      dedupeCallback(name, p.requestedVersion, oldPkg, newPkg);
                  }
              }
          })
        } else {
          // otherwise dedupe each package to its maxSatisfying version
          packages.forEach(p => {
              const targetVersion = semver.maxSatisfying(versions, p.requestedVersion);
              if (targetVersion === null) return;
              if (targetVersion !== p.pkg.version) {
                  const dedupedPackage = packages.find( p => p.pkg.version === targetVersion);

                  const key = `${name}@${p.requestedVersion}`;
                  const newPkg = dedupedPackage.pkg;
                  const oldPkg = json[key];
                  if (newPkg !== oldPkg) {
                      json[key] = newPkg;
                      if (dedupeCallback) {
                          dedupeCallback(name, p.requestedVersion, oldPkg, newPkg);
                      }
                  }
              }
          })
        }
    });

    return lockfile.stringify(json);
}

