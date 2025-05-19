# Contributing

When it comes to open source, there are different ways you can contribute, all
of which are valuable. Here's few guidelines that should help you as you prepare
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

The following steps will get you setup to contribute changes to this repo:

1. Fork this repo.

2. Clone your forked repo: `git clone git@github.com:{your_username}/zod.git`

3. Run `pnpm i` to install dependencies.

4. Start playing with the code! You can do some simple experimentation in [`playground.ts`](playground.ts) (see `pnpm play` below) or start implementing a feature right away.

## Alternative: VSCode Dev Container setup

For an officially supported isolated dev environment that automatically installs dependencies for you:

1. `F1` in VSCode and start typing `Dev Containers: Clone Repository in Named Container Volume` to run the command.
2. For the repo, paste `git@github.com:{your_username}/zod.git` if you're using ssh.
3. Click `Create a new volume...` and name it `zod` and the folder name as `zod`.

Note: if you can't see `Dev Containers` in the `F1` menu, follow [this guide](https://code.visualstudio.com/docs/devcontainers/tutorial) to install the needed extension.
In the OSS version of VSCode the extension may be not available.

### Commands

**`pnpm build`**

- deletes `lib` and re-compiles `src` to `lib`

**`pnpm test`**

- runs all Vitest tests and generates coverage badge

**`pnpm test:watch`**

- runs all Vitest tests and

**`pnpm test <file>`**

- runs all test files that match `<file>`

**`pnpm test --filter <ws> <file>`**

- runs all test files in `<ws>` that match `<file>` (e.g. `"enum"` will match `"enum.test.ts"`)

**`pnpm play`**

- executes [`playground.ts`](playground.ts), watches for changes. useful for experimentation

### Tests

Zod uses Vitest for testing. After implementing your contribution, write tests for it. Just create a new file in the `tests` directory of any workspace, or add additional tests to an existing file if appropriate.

> Zod uses git hooks to execute tests before `git push`. Before submitting your PR, run `pnpm test` to make sure there are no (unintended) breaking changes.

### Documentation

The Zod documentation lives in the README.md. Be sure to document any API changes you implement.

## License

By contributing your code to the zod GitHub repository, you agree to
license your contribution under the MIT license.
