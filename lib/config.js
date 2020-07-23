const fs = require('fs');

const getConfig = () => {
  const configFile = '.github/bundlewatch.json';

  if (!fs.existsSync(configFile)) {
    throw new Error(`${configFile} not found`);
  }

  const content = fs.readFileSync(configFile);
  return JSON.parse(content);
};

module.exports = {
  getConfig,
};
