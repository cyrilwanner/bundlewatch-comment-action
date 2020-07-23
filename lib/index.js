const core = require('@actions/core');
const github = require('@actions/github');
const bundlewatchApi = require('bundlewatch').default;
const { getConfig } = require('./config');
const { buildComment } = require('./comment');

try {
  // get inputs
  const githubToken = core.getInput('github-token');
  const bundlewatchGithubToken = core.getInput('bundlewatch-github-token');

  // get bundlwatch config
  const bundlewatchConfig = getConfig();

  (async () => {
    // process commit through bunldewatch
    const results = await bundlewatchApi({
      ...bundlewatchConfig,
      ci: {
        ...(bundlewatchConfig.ci || {}),
        githubAccessToken: bundlewatchGithubToken,
      }
    });

    const event = github.context.payload.action;

    // only post comment on PR events
    if ((event === 'opened' || event === 'synchronize') && github.context.payload.pull_request) {
      // post comment
      const octokit = github.getOctokit(githubToken);
      await octokit.issues.createComment({
        owner: github.context.payload.repository.owner.login,
        repo: github.context.payload.repository.name,
        issue_number: github.context.payload.pull_request.number,
        body: buildComment(results),
      });
    }

    // set action status on failure
    if (results.status === 'fail') {
      core.setFailed(results.summary);
    }
  })();
} catch (error) {
  core.setFailed(error.message);
}
