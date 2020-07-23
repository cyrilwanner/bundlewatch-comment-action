# bundlewatch-comment-action

Post a comment to PRs with stats provided by BundleWatch using GitHub Actions.

## Installation

Visit https://service.bundlewatch.io/setup-github and store the `BUNDLEWATCH_GITHUB_TOKEN` in a secret in your repository.

Add the action to your workflow:

```yml
on:
  push:
    branches: [ master ]
  pull_request:
    types: [ opened, synchronize ]

name: Generate Pull Request Stats

jobs:
  stats:
    name: PR Stats
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - uses: cyrilwanner/bundlewatch-comment-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          bundlewatch-github-token: ${{ secrets.BUNDLEWATCH_GITHUB_TOKEN }}
```

The action looks for the BundleWatch configuration in `.github/bundlewatch.json`.

## Inputs

* `github-token`: You can use the token automatically provided by GitHub Actions using `${{ secrets.GITHUB_TOKEN }}`. You don't need to do anything else.
If you want the comment to be posted from a specific user, you can use the token of this user here instead.
* `bundlewatch-github-token`: The BundleWatch token provided by https://service.bundlewatch.io/setup-github.

## License

Licensed under the [MIT](https://github.com/cyrilwanner/bundlewatch-comment-action/blob/master/LICENSE) license.

© Copyright Cyril Wanner

