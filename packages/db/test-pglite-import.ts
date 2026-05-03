// @ts-expect-error
import pgliteDataPath from '@electric-sql/pglite/dist/pglite.data' with {
  type: 'file',
};

console.log('imported:', pgliteDataPath);
