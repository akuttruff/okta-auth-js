import StorageManager from '../../lib/StorageManager';
import { CookieOptions, StorageManagerOptions, StorageOptions, StorageUtil } from '../../lib/types';

describe('StorageManager', () => {

  const mockStorage = {};
  function mockStorageUtil(): StorageUtil {
    return {
      findStorageType: jest.fn().mockReturnValue('mock'),
      getStorageByType: jest.fn().mockReturnValue(mockStorage)
    } as unknown as StorageUtil;
  }

  function setup(options: StorageManagerOptions = {}, cookieOptions: CookieOptions = {}, storageUtil?: StorageUtil) {
    if (!storageUtil) {
      storageUtil = mockStorageUtil();
    }
    return new StorageManager(options, cookieOptions, storageUtil);
  }

  describe('getOptionsForSection', () => {
      it('unknown section returns an empty object', () => {
        const storageManager = setup();
        const options = storageManager.getOptionsForSection('unknown');
        expect(options).toEqual({});
      });
      it('named section returns config', () => {
        const config: StorageOptions = {
          storageType: 'memory'
        };
        const storageManager = setup({
          mySection: config
        });
        const options = storageManager.getOptionsForSection('mySection');
        expect(options).toEqual(config);
      });

      it('includes cookie config', () => {
        const config: StorageOptions = {
          storageType: 'memory'
        };
        const storageManager = setup({
          mySection: config
        }, {
          secure: true
        });
        const options = storageManager.getOptionsForSection('mySection');
        expect(options.storageType).toBe('memory');
        expect(options.secure).toBe(true);
      });

      it('storageManager config overrides cookie config', () => {
        const config: StorageOptions = {
          storageType: 'memory',
          secure: false
        };
        const storageManager = setup({
          mySection: config
        }, {
          secure: true,
          sameSite: 'none'
        });
        const options = storageManager.getOptionsForSection('mySection');
        expect(options.storageType).toBe('memory');
        expect(options.sameSite).toBe('none'); // from cookie config
        expect(options.secure).toBe(false); // overridden by storage manager config
      });

      it('passed options override previous config', () => {
        const config: StorageOptions = {
          storageType: 'memory',
          storageKey: 'foo'
        };
        const storageManager = setup({
          mySection: config
        }, {
          sameSite: 'none',
          secure: true
        });
        const options = storageManager.getOptionsForSection('mySection', {
          sameSite: 'lax',
          storageType: 'cookie'
        });
        expect(options.storageKey).toBe('foo'); // storageManager
        expect(options.secure).toBe(true); // cookie
        expect(options.storageType).toBe('cookie'); // passed
        expect(options.sameSite).toBe('lax'); // passed
      });
  });

  describe('getStorage', () => {

    it('if "storageProvider" option is set, it is returned', () => {
      
    });

    describe('no "storageType"', () => {

      describe('but have "storageTypes"', () => {
        it('will use the first in the list, and fallback to subsequent entries', () => {

        });
      });

      describe('and no "storageTypes"', () => {
        it('will throw an error', () => {

        });
      });
    });

    describe('with "storageType"', () => {

      describe('and "storageTypes"', () => {
        it('if "storageType" matches an entry in "storageTypes", it will use subsequent types as a fallback', () => {

        });
        it('if "storageType" does not match an entry in "storageTypes" it will be used with no fallback', () => {

        });
      });

      describe('but no "storageTypes"', () => {
        it('it will be used with no fallback', () => {

        });
      });
    });

  }); 


  describe('getTransactionStorage', () => {

    it('options are loaded from the "transaction" section of the storageManager config', () => {

    });

    it('default storageKey is "okta-transaction-storage"', () => {

    });

    it('can set a storageKey', () => {

    });
  }); 

  describe('getTokenStorage', () => {
    it('options are loaded from the "token" section of the storageManager config', () => {

    });
    
    it('default storageKey is "okta-token-storage"', () => {

    });

    it('can set a storageKey', () => {

    });
  }); 

  describe('getHttpCache', () => {
    it('options are loaded from the "cache" section of the storageManager config', () => {

    });
    
    it('default storageKey is "okta-cache-storage"', () => {

    });

    it('can set a storageKey', () => {

    });
  }); 





});
