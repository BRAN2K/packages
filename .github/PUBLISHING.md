# Publishing Guide

This guide explains how to publish packages from this monorepo using npm trusted publishing.

## NPM Trusted Publishing Overview

This repository uses [npm provenance](https://docs.npmjs.com/generating-provenance-statements) to publish packages securely without long-lived tokens. Each published package gets a cryptographically signed attestation that links it to its source code and build process.

## Prerequisites

1. **NPM Account Setup**: Configure your npm account to accept OIDC tokens from GitHub
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a new automation token (granular access token) if you haven't already
   - The repository will use GitHub's OIDC provider instead of a long-lived token

2. **GitHub Secrets**: Add `NPM_TOKEN` to repository secrets
   - Go to Settings → Secrets and variables → Actions
   - Add a secret named `NPM_TOKEN` with your npm automation token
   - This is still needed for authentication, but provenance adds extra security

## Adding a New Package

To add a new package to the trusted publishing setup:

### 1. Create the Package Structure

```bash
mkdir -p packages/your-package
cd packages/your-package
npm init -y
```

### 2. Configure package.json

Ensure your package.json includes:

```json
{
  "name": "@bran2k/your-package",
  "version": "0.1.0",
  "private": false,
  "repository": {
    "type": "git",
    "url": "git+https://github.com/BRAN2K/packages.git",
    "directory": "packages/your-package"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 3. Create GitHub Workflow

Create `.github/workflows/publish-your-package.yml`:

```yaml
name: Publish Your Package

on:
  workflow_dispatch:
    inputs:
      beta:
        description: "Publish as beta (for testing)"
        required: false
        type: boolean
        default: false

permissions:
  contents: read
  id-token: write # Required for npm provenance

concurrency:
  group: publish-your-package
  cancel-in-progress: false

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Publish your-package
        uses: ./.github/actions/publish-logger
        with:
          package: packages/your-package
          beta: ${{ inputs.beta }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 4. Use the Shared Publish Action

The repository already has a reusable publish action at `.github/actions/publish-logger/action.yml` that:
- Handles beta versioning
- Publishes with `--provenance` flag
- Works with any workspace package

You can reuse this action for all packages by referencing it in your workflow.

## Publishing a Package

1. **Via GitHub Actions** (Recommended):
   - Go to the Actions tab in GitHub
   - Select the publish workflow for your package
   - Click "Run workflow"
   - Choose whether to publish as beta
   - The workflow will publish with provenance automatically

2. **Manually** (Not recommended for production):
   ```bash
   npm publish --workspace packages/your-package --provenance --access public
   ```
   Note: Manual publishing requires proper npm authentication and may not generate provenance unless run in CI.

## Verifying Provenance

After publishing, users can verify your package's provenance:

```bash
npm audit signatures
```

Or view it on npm:
- Go to https://www.npmjs.com/package/@bran2k/your-package
- Click on "Provenance" to see the attestation

The provenance statement includes:
- Source repository URL
- Commit SHA
- Workflow file that built and published the package
- Build environment details

## Security Benefits

1. **Supply chain security**: Users can verify packages came from your repository
2. **No long-lived tokens in workflows**: OIDC tokens are short-lived
3. **Transparency**: Public record of build and publish process
4. **Tamper detection**: Any modification after publish is detectable

## Troubleshooting

### Provenance generation fails

- Ensure `id-token: write` permission is in workflow
- Verify workflow runs on GitHub-hosted runners (not self-hosted)
- Check that npm version is 9.5.0 or later
- Ensure package is public (private packages don't support provenance)

### Publishing fails with authentication error

- Verify `NPM_TOKEN` secret is set correctly
- Check token has publish permissions for your package
- Ensure token is an automation token, not a classic token

### Package not showing provenance on npm

- Provenance is only generated when published from GitHub Actions
- Must use `--provenance` flag
- Package must be public
- npm CLI must be 9.5.0 or later
