import { secrets } from '@foyer/db/schema';
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DatabaseClient } from '../database.ts';

export interface SecretServiceShape {
  readonly get: (id: number) => Effect.Effect<string | null, Error>;
  readonly put: (input: {
    readonly name: string;
    readonly value: string;
    readonly userId: string;
    readonly ownedByConnectionId?: number | null;
  }) => Effect.Effect<{ readonly id: number; readonly uuid: string }, Error>;
  readonly remove: (id: number) => Effect.Effect<void, Error>;
}

export class SecretService extends Context.Tag('SecretService')<
  SecretService,
  SecretServiceShape
>() {}

const DEV_FALLBACK_KEY = 'foyer-dev-fallback-key-32-bytes!!';

function getKeyMaterial(envKey: string | undefined): string {
  if (!envKey) {
    console.warn(
      'FOYER_ENCRYPTION_KEY is not set. Using static dev fallback — DO NOT USE IN PRODUCTION.',
    );
    return DEV_FALLBACK_KEY;
  }
  return envKey;
}

async function importKey(material: string): Promise<CryptoKey> {
  const keyData = new Uint8Array(
    Buffer.from(material.padEnd(32, '!').slice(0, 32)),
  );
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptValue(
  value: string,
  key: CryptoKey,
): Promise<{ readonly ciphertext: Uint8Array; readonly iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );
  return {
    ciphertext: new Uint8Array(ciphertext),
    iv: new Uint8Array(iv),
  };
}

async function decryptValue(
  ciphertext: Uint8Array,
  iv: Uint8Array,
  key: CryptoKey,
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as Uint8Array<ArrayBuffer> },
    key,
    ciphertext as unknown as Uint8Array<ArrayBuffer>,
  );
  return new TextDecoder().decode(decrypted);
}

export const SecretServiceLive = Layer.effect(
  SecretService,
  Effect.gen(function* () {
    const db = yield* DatabaseClient;
    const keyMaterial = getKeyMaterial(process.env.FOYER_ENCRYPTION_KEY);
    const key = yield* Effect.promise(() => importKey(keyMaterial));

    const get = (id: number): Effect.Effect<string | null, Error> =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () => db.select().from(secrets).where(eq(secrets.id, id)),
          catch: (cause: unknown) => new Error(String(cause)),
        });
        const row = rows[0];
        if (!row) return null;
        const decrypted = yield* Effect.promise(() =>
          decryptValue(row.encryptedValue as Buffer, row.iv as Buffer, key),
        );
        return decrypted;
      });

    const put = (input: {
      readonly name: string;
      readonly value: string;
      readonly userId: string;
      readonly ownedByConnectionId?: number | null;
    }): Effect.Effect<{ readonly id: number; readonly uuid: string }, Error> =>
      Effect.gen(function* () {
        const encrypted = yield* Effect.promise(() =>
          encryptValue(input.value, key),
        );
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(secrets)
              .values({
                name: input.name,
                userId: input.userId,
                encryptedValue: encrypted.ciphertext,
                iv: encrypted.iv,
                ownedByConnectionId: input.ownedByConnectionId ?? null,
              })
              .returning(),
          catch: (cause: unknown) => new Error(String(cause)),
        });
        const row = rows[0] as { id: number; uuid: string } | undefined;
        if (!row) {
          return yield* Effect.fail(new Error('Failed to insert secret'));
        }
        return { id: row.id, uuid: row.uuid };
      });

    const remove = (id: number): Effect.Effect<void, Error> =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          db
            .delete(secrets)
            .where(eq(secrets.id, id))
            .execute()
            .then(() => {}),
        ).pipe(Effect.mapError((e) => new Error(String(e))));
      });

    return { get, put, remove };
  }),
);
