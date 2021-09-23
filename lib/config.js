const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");

const getBranchNameFromRef = (ref) => {
  return ref.replace(/^refs\/heads\//, "");
};

const getConfig = () => {
  let config = {
    files: [],
  };
  
  const configFile = core.getInput("bundlewatch-config");
  const githubPayload = github.context.payload;

  if (!githubPayload) {
    throw new Error("Failed when trying to get GitHub Payload");
  }

  if (configFile) {
    try {
      const projectBundlewatchConfig = require(path.resolve("./", configFile));

      config = {
        ...config,
        ...projectBundlewatchConfig,
      };
    } catch {
      core.setFailed(
        `Failed while reading the configuration file at "${configFile}"`
      );

      return 1;
    }
  } else {
    // Try getting the configuration from package.json
    try {
      const projectBundlewatchConfig = JSON.parse(
        fs.readFileSync("package.json", "utf-8")
      ).bundlewatch;

      config = {
        ...config,
        ...projectBundlewatchConfig,
      };
    } catch {
      core.setFailed(
        `Failed while reading the configuration from package.json`
      );

      return 1;
    }
  }

  return {
    ...config,
    ci: {
      ...config.ci,
      repoOwner: githubPayload.repository
        ? githubPayload.repository.owner.login
        : "",
      repoName: githubPayload.repository ? githubPayload.repository.name : "",
      repoCurrentBranch: githubPayload.pull_request
        ? githubPayload.pull_request.head.ref
        : getBranchNameFromRef(githubPayload.ref),
      repoBranchBase:
        core.getInput("branch-base") ||
        (githubPayload.pull_request
          ? githubPayload.pull_request.base.ref
          : "master"),
      commitSha: githubPayload.pull_request
        ? githubPayload.pull_request.head.sha
        : githubPayload.after,
    },
  };
};

module.exports = {
  getConfig,
};
