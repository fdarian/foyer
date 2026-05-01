import { Effect } from 'effect';
import { withExecutor } from './src/index.ts';

/**
 * Smoke test: verify withExecutor lifecycle — spins up, runs action,
 * and ensures executor.close() is called via Effect.ensuring.
 */
const smoke = Effect.gen(function* () {
  let closed = false;

  const result = yield* withExecutor(
    'smoke-test',
    () => Effect.void,
    () => Effect.succeed(42),
    {
      onClose: () => {
        closed = true;
      },
    },
  );

  if (!closed) {
    return yield* Effect.fail(new Error('executor.close() was not called'));
  }
  if (result !== 42) {
    return yield* Effect.fail(new Error(`Expected 42, got ${result}`));
  }
  return 'ok';
});

Effect.runPromise(smoke)
  .then((outcome) => {
    console.log('Smoke test passed:', outcome);
  })
  .catch((err) => {
    console.error('Smoke test failed:', err);
    process.exit(1);
  });
