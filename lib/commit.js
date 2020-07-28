const github = require('@actions/github');
const exec = require('child_process').execSync;

const getCurrentCommit = async () => {
  if (!process.env.GITHUB_REF.endsWith('/merge')) {
    return github.context.sha;
  }

  const currentCommit = exec('git log -1 | tail -1').toString().trim();
  const matches = currentCommit.match(/Merge\s+(?<hash>[a-f0-9]+)\s/mi);

  return matches && matches.groups.hash;
};

module.exports = {
  getCurrentCommit,
};
