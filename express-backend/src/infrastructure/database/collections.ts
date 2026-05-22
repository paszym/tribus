import type { Collection, Db } from 'mongodb';
import type { UserDocument } from './types/UserDocument';
import type { RefreshTokenDocument } from './types/RefreshTokenDocument';

export interface Collections {
  users: Collection<UserDocument>;
  tokens: Collection<RefreshTokenDocument>;
}

export function createCollections(db: Db): Collections {
  return {
    users: db.collection<UserDocument>('users'),
    tokens: db.collection<RefreshTokenDocument>('tokens'),
  };
}
