# NPM Trusted Publishing Implementation Summary

## What is NPM Trusted Publishing?

NPM Trusted Publishing (also called npm provenance) is a security feature that:
- Uses GitHub's OIDC (OpenID Connect) instead of long-lived tokens
- Creates cryptographically signed attestations linking packages to source code
- Provides transparency and verifiability for the software supply chain
- Helps prevent supply chain attacks by ensuring packages come from verified sources

## Changes Implemented

### 1. GitHub Workflow Updates (`.github/workflows/publish-logger.yml`)

Added the `id-token: write` permission required for OIDC authentication:

```yaml
permissions:
  contents: read
  id-token: write # Required for npm provenance
```

This permission allows GitHub Actions to request an OIDC token that npm will use to verify the workflow's identity.

### 2. Publish Action Updates (`.github/actions/publish-logger/action.yml`)

Added `--provenance` and `--access public` flags to npm publish commands:

```bash
npm publish --workspace "${{ inputs.package }}" --provenance --access public
npm publish --workspace "${{ inputs.package }}" --tag beta --provenance --access public
```

The `--provenance` flag tells npm to generate an attestation that includes:
- The GitHub repository and commit SHA
- The workflow that built the package
- The build environment details

### 3. Documentation Updates

- **README.md**: Added comprehensive section explaining npm trusted publishing
- **.github/PUBLISHING.md**: Created detailed guide for:
  - Adding new packages to the monorepo
  - Publishing packages with provenance
  - Verifying provenance
  - Troubleshooting common issues

## How to Use This Setup

### For the Current Package (logger)

The existing workflow `.github/workflows/publish-logger.yml` is ready to use:

1. Go to GitHub Actions tab
2. Select "Publish Logger" workflow
3. Click "Run workflow"
4. Choose beta or production publish
5. Package will be published with provenance automatically

### For New Packages

When adding a new package to the monorepo:

1. Create package directory: `packages/your-package/`
2. Configure package.json with proper repository and publishConfig
3. Create workflow: `.github/workflows/publish-your-package.yml`
4. Reference the shared action: `.github/actions/publish-logger`
5. Ensure workflow has `id-token: write` permission

See `.github/PUBLISHING.md` for complete instructions.

## Verification

After publishing, users can verify your packages:

```bash
npm audit signatures
```

Or view provenance on npm.js at:
```
https://www.npmjs.com/package/@bran2k/logger
```

Click the "Provenance" link to see the attestation.

## Security Benefits

1. **No long-lived tokens in workflows**: OIDC tokens expire after the workflow completes
2. **Supply chain transparency**: Anyone can verify packages came from your repository
3. **Tamper detection**: Modifications after publish are detectable
4. **Build reproducibility**: Links packages to exact source code and build environment

## Requirements

- npm CLI 9.5.0 or later (for provenance support)
- GitHub-hosted runners (OIDC not available on self-hosted)
- Public packages (private packages don't support provenance)
- NPM_TOKEN secret configured in repository settings

## Notes

- The existing NPM_TOKEN secret is still required for authentication
- Provenance is an additional security layer on top of token auth
- All publish commands now include `--access public` for clarity
- The reusable action can be shared across all packages in the monorepo
