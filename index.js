#!/usr/bin/env node

const commander = require('commander')
const fs = require('fs')
const promisify = require('util').promisify;

const listDuplicates = require('./modules/list-duplicates');
const fixDuplicates = require('./modules/fix-duplicates');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

commander
    .command('list-duplicates')
    .description('List duplicated packages in a yarn.lock file')
    .action(async () => {
        let packageJson;
        try {
            packageJson = await readFile('package.json', 'utf8');
        } catch(e) {
            console.error('Unable to read package.json!');
            process.exit(1);
        }

        let lockfile;
        try {
            lockfile = await readFile('yarn.lock', 'utf8');
        } catch(e) {
            console.error('Unable to read yarn.lock!');
            process.exit(1);
        }

        const lines = await listDuplicates(packageJson, lockfile);
        lines.forEach(line => console.log(line));
    });

commander
    .command('fix-duplicates')
    .description('Fix duplicated packages in a yarn.lock file')
    .action(async () => {
        let packageJson;
        try {
            packageJson = await readFile('package.json', 'utf8');
        } catch(e) {
            console.error('Unable to read package.json!');
            process.exit(1);
        }

        let lockfile;
        try {
            lockfile = await readFile('yarn.lock', 'utf8');
        } catch(e) {
            console.error(`Unable to read yarn.lock!`);
            process.exit(1);
        }

        const fixedLockfile = await fixDuplicates(packageJson, lockfile);
        await writeFile('yarn.lock', fixedLockfile, 'utf8');
        process.exit(0);
    });

commander
    .command('*', '', {noHelp: true, isDefault: true})
    .action(function(env){
        commander.help();
    });

commander.parse(process.argv);
if (!commander.args.length) commander.help();

