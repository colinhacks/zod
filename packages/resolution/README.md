# Package resolution checks

Run from the repository root:

```sh
nub run build
nub run --filter @zod/resolution test:all
```

These checks inspect the published declarations with Are the Types Wrong and execute the built CommonJS and ES modules on plain Node through Nub.
