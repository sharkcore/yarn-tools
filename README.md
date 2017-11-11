# Yarn tools

Collection of tools to work with yarn-based repositories.

# Installation

Install the package globally:

```
npm install -g @sharkcore/yarn-tools
```

or

```
yarn global add @sharkcore/yarn-tools
```


# Usage
---
## list-duplicates

### Description
Inspect a `yarn.lock` file looking for modules that can be de-duplicated. See `fix-duplicates` to automatically fix those duplicated packages.

### Command
`list-duplicates

### Example

```
 └▸ yarn-tools list-duplicates

Package "supports-color" wants ^3.1.0 and got 3.1.2, but could use existing version 3.2.3
Package "supports-color" wants ^3.1.1 and got 3.1.2, but could use existing version 3.2.3
Package "supports-color" wants ^3.1.2 and got 3.1.2, but could use existing version 3.2.3
```

---

## fix-duplicates

### Description
Fixes duplicates packages in a `yarn.lock` file.

### Command
`fix-duplicates

### Example

```
 └▸ yarn-tools fix-duplicates
```

# License

Original work Copyright (c) 2017 Atlassian and others. Modified work Copyright (c) 2017-present Sharkcore

Apache 2.0 licensed, see [LICENSE.txt](LICENSE.txt) file.
