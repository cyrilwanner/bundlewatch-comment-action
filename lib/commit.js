const github = require('@actions/github');
const exec = require('@actions/exec');

const getCurrentCommit = async () => {
  if (!process.env.GITHUB_REF.endsWith('/merge')) {
    return github.context.sha;
  }

  let currentCommit = '';
  await exec.exec(`bash -c "git log -1 | tail -1"`, [], {
    listeners: {
      stdout: (data) => {
        currentCommit += data.toString();
      },
    },
  });
  currentCommit = currentCommit.trim();
  console.log({ currentCommit });

  const matches = currentCommit.match(/Merge\s+(?<hash>[a-f0-9]+)\s/mi);
  console.log({ matches });

  return matches && matches.groups.hash;
};

module.exports = {
  getCurrentCommit,
};
