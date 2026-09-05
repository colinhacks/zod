# Contributing

When it comes to open source, there are different ways you can contribute, all
of which are valuable. Here's a few guidelines that should help you as you prepare
your contribution.

## Initial steps

Before you start working on a contribution, create an issue describing what you want to build. It's possible someone else is already working on something similar, or perhaps there is a reason that feature isn't implemented. The maintainers will point you in the right direction.

<!-- ## Submitting a Pull Request

- Fork the repo
- Clone your forked repository: `git clone git@github.com:{your_username}/zod.git`
- Enter the zod directory: `cd zod`
- Create a new branch off the `master` branch: `git checkout -b your-feature-name`
- Implement your contributions (see the Development section for more information)
- Push your branch to the repo: `git push origin your-feature-name`
- Go to https://github.com/colinhacks/zod/compare and select the branch you just pushed in the "compare:" dropdown
- Submit the PR. The maintainers will follow up ASAP. -->

## Development

The following steps will get you set up to contribute changes to this repo:

Install [Nub](https://nubjs.com/docs) v0.8.3 first. Nub manages dependencies, runs scripts and TypeScript, and provisions the Node version in `.nvmrc`. The existing `pnpm-lock.yaml` is the lockfile format, not a requirement to install pnpm.

```sh
curl -fsSL https://nubjs.com/install.sh | bash -s -- 0.8.3
```

Restart the shell after installation so Nub is on `PATH`.

1. Fork this repo.

2. Clone your forked repo: `git clone git@github.com:{your_username}/zod.git`

3. Run `nub install --frozen-lockfile` to install dependencies.

4. Start playing with the code! You can do some simple experimentation in [`play.ts`](play.ts) (see `nub run dev:play` below) or start implementing a feature right away.

### Building Docs Locally

#### Dev Server

To start a dev server, run:

```sh
nub run --filter=@zod/docs dev
```

#### Production Build

To build `@zod/docs` for production, you will need to set the `GITHUB_TOKEN` environment variable to a personal access token. [Create a granular personal access token](https://github.com/settings/personal-access-tokens/new) and accept the defaults (no extra permissions are necessary). Then:

```sh
export GITHUB_TOKEN=your_token_here # persists in shell session
nub run --filter=@zod/docs build
```

> The `GITHUB_TOKEN` environment variable is used to fetch stargazer counts of projects in Zod's ecosystem.

## Alternative: VSCode Dev Container setup

For an officially supported isolated dev environment that automatically installs dependencies for you:

1. `F1` in VSCode and start typing `Dev Containers: Clone Repository in Named Container Volume` to run the command.
2. For the repo, paste `git@github.com:{your_username}/zod.git` if you're using ssh.
3. Click `Create a new volume...` and name it `zod` and the folder name as `zod`.

Note: if you can't see `Dev Containers` in the `F1` menu, follow [this guide](https://code.visualstudio.com/docs/devcontainers/tutorial) to install the needed extension.
In the OSS version of VSCode the extension may not be available.

### Commands

| Command | Purpose |
| --- | --- |
| `nub run build` | Build Zod and Zod Mini, including their declarations |
| `nub run test` | Run all Vitest projects, including compile mode and type checks |
| `nub run test:watch` | Start Vitest in watch mode |
| `nub run test <file>` | Run test files matching `<file>` |
| `nub run dev:play` | Execute [`play.ts`](play.ts) against source |
| `nub run dev:watch play.ts` | Re-run the playground when its imports change |
| `nub run --filter @zod/resolution test:all` | Check the built package's declarations and module resolution |
| `nub add -Dw <package>` | Add a root development dependency |

Run `nub run build` before testing built-package resolution and bundle sizes. Repository scripts use `nub exec --node` for third-party tools so tests retain plain Node semantics.

### Tests

Zod uses Vitest for testing. After implementing your contribution, write tests for it. Just create a new file in the `tests` directory of any workspace, or add additional tests to an existing file if appropriate.

> Zod uses git hooks to execute tests before `git push`. Before submitting your PR, run `nub run test` to make sure there are no (unintended) breaking changes.

### Documentation

The documentation site lives in `packages/docs` with content located at `packages/docs/content`. Be sure to document any API changes you implement.

## License

By contributing your code to the zod GitHub repository, you agree to
license your contribution under the MIT license.
