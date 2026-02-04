# packages

A monorepo containing npm packages published with npm provenance (trusted publishing).

## NPM Trusted Publishing

This repository is configured to use [npm provenance](https://docs.npmjs.com/generating-provenance-statements) (trusted publishing), which provides:

- **Cryptographic verification**: Links published packages to their source code
- **Enhanced security**: No need for long-lived NPM tokens
- **Transparency**: Publicly verifiable build and publish process

### How it works

1. GitHub Actions workflow runs on GitHub-hosted runners
2. GitHub's OIDC provider authenticates the workflow
3. Packages are published with `--provenance` flag
4. npm generates a provenance attestation linking the package to the source

### Publishing packages

Packages are published via GitHub Actions workflows (e.g., `.github/workflows/publish-logger.yml`).

To publish a package:
1. Go to Actions tab in GitHub
2. Select the publish workflow for your package
3. Click "Run workflow"
4. Choose whether to publish as beta (for testing)

The workflow automatically generates provenance attestations for each published package.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
