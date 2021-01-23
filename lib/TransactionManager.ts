import { AuthSdkError } from './errors';
import StorageManager from './StorageManager';
import { StorageProvider } from './types';
import { AuthTransaction, isAuthTransaction } from './types/AuthTransaction';
import { warn } from './util';

export default class TransactionManager {
  storageManager: StorageManager;

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;
  }

  clear() {
    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    storage.clearStorage();

    // This is for compatibility with older versions of the signin widget. OKTA-304806
    storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
    storage.clearStorage();
    storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
    storage.clearStorage();
  }

  save(transaction: AuthTransaction) {
    // There must be only one transaction executing at a time.
    // Before saving, check to see if a transaction is already stored.
    // An existing transaction indicates a concurrency/race/overlap condition

    const storage = this.storageManager.getTransactionStorage();
    const obj = storage.getStorage();
    if (isAuthTransaction(obj)) {
      // eslint-disable-next-line max-len
      warn('a saved auth transaction exists in storage. This may indicate another auth flow is already in progress.');
    }

    // clear before saving.
    this.clear();

    storage.setStorage(transaction);
  }

  load(): AuthTransaction {
    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    let obj = storage.getStorage();
    if (isAuthTransaction(obj)) {
      return obj;
    }

    // Not found in the expected location? This is commonly caused by using an older version of the signin widget.
    // Read from the "PKCE meta"
    // Try reading from localStorage first.
    // This is for compatibility with older versions of the signin widget. OKTA-304806
    storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
    obj = storage.getStorage();
    // Verify the Meta
    if (!obj.codeVerifier) {
      // If meta is not valid, read from sessionStorage. This is expected for current versions of the SDK.
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
      obj = storage.getStorage();
      if (!obj.codeVerifier) {
        // If meta is not valid, throw an exception to avoid misleading server-side error
        // The most likely cause of this error is trying to handle a callback twice
        // eslint-disable-next-line max-len
        throw new AuthSdkError('Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.', null);
      }
    }
    return obj;
  }
}