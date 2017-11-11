const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver');

function garbageCollect(packageJson, lockfileJson) {
    const minimalDeps = new Set();
    const queue = [];

    const topLevelDeps = Object.assign(
        {},
        packageJson.dependencies,
        packageJson.devDependencies,
    );
    Object.entries(topLevelDeps).forEach(
        ([name, requestedVersion]) => {
            const key = `${name}@${requestedVersion}`;
            queue.push(key);
        }
    );

    // perform a BFS of dependencies, so we can delete the extraneous ones
    while (queue.length > 0) {
        const key = queue.shift();
        if (minimalDeps.has(key)) {
            continue;
        }
        minimalDeps.add(key);

        Object.entries(lockfileJson[key].dependencies || {}).forEach(
            ([name, requestedVersion]) => {
                const depKey = `${name}@${requestedVersion}`;
                queue.push(depKey);
            }
        );
    }

    const minimalLockfileJson = {};
    for (const key of minimalDeps) {
      minimalLockfileJson[key] = lockfileJson[key];
    }

    return minimalLockfileJson;
}


module.exports = (packageJsonData, lockfileData, dedupeCallback) => {
    const packageJson = JSON.parse(packageJsonData);
    const json = lockfile.parse(lockfileData).object;

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

    // now that we've deduped, remove any extraneous deps
    const minimalJson = garbageCollect(packageJson, json);

    return lockfile.stringify(minimalJson);
}

