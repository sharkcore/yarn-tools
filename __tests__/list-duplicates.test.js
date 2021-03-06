const listDuplicates = require('../src/list-duplicates');

test('lists duplicate and extraenous deps', () => {
    const packageJsonData = `
  {
      "dependencies": {
          "foo": ">=2.0.0",
          "bar": ">=3.0.0"
      }
  }
`;
    const lockfileData = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

foo@>=2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/foo/-/foo-2.0.0.tgz#deadbeef"
  dependencies:
    bar ">=1.0.0"

bar@>=3.0.0:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/bar/-/bar-3.0.1.tgz#deadbeef"

bar@>=1.0.0:
  version "2.5.0"
  resolved "https://registry.yarnpkg.com/bar/-/bar-2.5.0.tgz#deadbeef"
  dependencies:
    baz ">=1.0.0"

baz@>=1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/baz/-/baz-1.0.0.tgz#deadbeef"
`;

    const result = listDuplicates(packageJsonData, lockfileData);

    expect(result).toEqual([
        'Package "bar" wants >=1.0.0 and got 2.5.0, but could use existing version 3.0.1',
        'Package "baz@>=1.0.0" is extraenous after deduplication, and could be removed.',
    ]);
});
