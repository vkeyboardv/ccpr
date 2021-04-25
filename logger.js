const chalk = require('chalk');

const PREFIX = chalk.bold('\nCCPR');

module.exports = {
  info: (...args) => console.log(chalk.bgBlue(PREFIX), ...args),
  error: (...args) => console.error(chalk.bgRed(PREFIX), ...args),
};
