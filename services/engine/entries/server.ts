import * as BunRuntime from '@effect/platform-bun/BunRuntime';
import { boot } from '../src/boot.ts';

const effect = await boot();
BunRuntime.runMain(effect);
