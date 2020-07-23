const core = require('@actions/core');
const github = require('@actions/github');
const bundlewatchApi = require('bundlewatch');
const { getConfig } = require('./config');
const { buildComment } = require('./comment');

const event = github.context.payload.action;

// only run action on specific events
if (event !== 'opened' && event !== 'synchronize') {
  console.log('Action skipped for event', event);
  process.exit(0);
}

try {
  // get inputs
  const githubToken = core.getInput('github-token');
  const bundlewatchGithubToken = core.getInput('bundlewatch-github-token');

  // propagate bundlewatch github token to the environment
  process.env.BUNDLEWATCH_GITHUB_TOKEN = bundlewatchGithubToken;

  // get bundlwatch config
  const bundlewatchConfig = getConfig();

  (async () => {
    // process commit through bunldewatch
    const results = await bundlewatchApi(bundlewatchConfig);

    // post comment
    const octokit = github.getOctokit(githubToken);
    await octokit.issues.createComment({
      owner: github.context.payload.repository.owner.login,
      repo: github.context.payload.repository.name,
      issue_number: github.context.payload.pull_request.number,
      body: buildComment(results),
    })
  })();
} catch (error) {
  core.setFailed(error.message);
}
