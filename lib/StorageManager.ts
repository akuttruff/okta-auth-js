
import {
  PKCE_STORAGE_NAME,
  TOKEN_STORAGE_NAME,
  TRANSACTION_STORAGE_NAME,
  CACHE_STORAGE_NAME
} from './constants';
import {
  StorageUtil,
  StorageProvider,
  StorageOptions,
  PKCEStorage,
  CookieOptions,
  TransactionStorage,
  StorageManagerOptions,
  SimpleStorage
} from './types';
import SavedObject from './SavedObject';

export default class StorageManager {
  storageManagerOptions: StorageManagerOptions;
  cookieOptions: CookieOptions;
  storageUtil: StorageUtil;

  constructor(storageManagerOptions: StorageManagerOptions, cookieOptions: CookieOptions, storageUtil: StorageUtil) {
    this.storageManagerOptions = storageManagerOptions;
    this.cookieOptions = cookieOptions;
    this.storageUtil = storageUtil;
  }

  // combines defaults in order
  getOptionsForSection(sectionName: string, overrideOptions?: StorageOptions) {
    return Object.assign({}, this.cookieOptions, this.storageManagerOptions[sectionName], overrideOptions);
  }

  // generic method to get any available storage provider
  getStorage(options: StorageOptions): SimpleStorage {
    if (options.storageProvider) {
      return options.storageProvider;
    }

    let { storageType, storageTypes } = options;

    // Maintain compatibility. Automatically fallback. May change in next major version. OKTA-362589
    if (storageType && storageTypes) {
      const idx = storageTypes.indexOf(storageType);
      if (idx >= 0) {
        storageTypes = storageTypes.slice(idx);
        storageType = null;
      }
    }
    
    if (!storageType) {
      storageType = this.storageUtil.findStorageType(storageTypes);
    }
    return this.storageUtil.getStorageByType(storageType, options);
  }

  // stateToken, interactionHandle
  getTransactionStorage(options?: StorageOptions): TransactionStorage {
    options = this.getOptionsForSection('transaction', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TRANSACTION_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // access_token, id_token, refresh_token
  getTokenStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('token', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TOKEN_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // caches well-known response, among others
  getHttpCache(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('cache', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || CACHE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // Will be removed in an upcoming major version. OKTA-362589
  getLegacyPKCEStorage(options?: StorageOptions): PKCEStorage {
    options = this.getOptionsForSection('legacy-pkce', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || PKCE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }
}
