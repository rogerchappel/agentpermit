# Verification

Release candidates should pass:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
node dist/cli.js check fixtures/mixed --format text
```

The mixed fixture intentionally exits `1` because it contains deny findings. A
passing smoke test asserts that behavior instead of hiding it.
