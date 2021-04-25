#!/usr/bin/env node

const open = require('open');
const yargs = require('yargs');
const log = require('./logger');

const argv = yargs
  .scriptName('ccpr')
  .usage('Usage: git push -u origin |& $0 [options]')
  .example('git push -u origin feature/super-feature |& $0 -b=dev -o')
  .example('git push -f origin |& $0')
  .option('branch', {
    description: 'Target branch',
    alias: 'b',
    type: 'string',
  })
  .option('open', {
    alias: 'o',
    description: 'Open url in the browser',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h').argv;

const SETUP_TO_TRACK_REMOTE_BRANCH = 'set up to track remote branch';
const CC_URL = 'https://us-east-1.console.aws.amazon.com/codesuite/codecommit/repositories';

const isFirstPush = str => str && ~str.indexOf(SETUP_TO_TRACK_REMOTE_BRANCH);

const getRepo = str => {
  const repo = str.match(/(?<=repos\/)(.*?)(?=\s|\n)/g);

  if (!repo) {
    throw new Error('Cannot match repo');
  }

  return [repo];
};

const getBranch = str => {
  const branch = str.match(/(?<=\-\>\s)(.*?)(?=\s|$)/g);

  if (!branch) {
    throw new Error('Cannot match branch');
  }

  return [branch];
};

const getPRUrl = (repo, currBranch) => {
  const targetBranch = argv.branch || 'master';

  return `${CC_URL}/${repo}/pull-requests/new/refs/heads/${targetBranch}/.../refs/heads/${currBranch}?region=us-east-1`;
};

const parse = str => getPRUrl(getRepo(str), getBranch(str));

const getLastTwoStrings = chunks => chunks.slice(-2).map(el => el.toString());

const main = () => {
  const chunks = [];

  process.stdin.pipe(process.stdout);

  process.stdin.on('data', chunk => {
    chunks.push(chunk);
  });

  process.stdin.on('end', () => {
    try {
      const [firstStr, lastStr] = getLastTwoStrings(chunks);

      if (!lastStr) {
        throw new Error('Cannot get chunk');
      }

      const url = isFirstPush(lastStr) ? parse(firstStr) : parse(lastStr);

      log.info(url);

      if (argv.open) {
        open(url);
      }
    } catch (err) {
      log.error(err.message);
      process.exit(1);
    }
  });
};

if (require.main === module) {
  if (process.stdin.isTTY) {
    yargs.showHelp();
  } else {
    main();
  }
} else {
  module.exports = { main, isFirstPush, getRepo, getBranch, getPRUrl, parse, getLastTwoStrings };
}
