import TransactionManager from '../../lib/TransactionManager';

describe('TransactionManager', () => {
  let transactionManager;
  let storageManager;

  beforeEach(() => {
    transactionManager = null;
    storageManager = null;
  });

  function createMockStorage() {
    return {
      getStorage: jest.fn,
      clearStorage: jest.fn()
    };
  }

  function createInstance() {
    storageManager = {
      getTransactionStorage: jest.fn().mockReturnValue(createMockStorage()),
      getLegacyPKCEStorage: jest.fn().mockReturnValue(createMockStorage())
    };
    transactionManager = new TransactionManager(storageManager);
  }

  describe('clear', () => {
    beforeEach(() => {
      createInstance();
    });
    it('clears transaction storage', () => {
      const clearStorage = jest.fn();
      jest.spyOn(storageManager, 'getTransactionStorage').mockReturnValue({
        clearStorage
      });
      transactionManager.clear();
      expect(clearStorage).toHaveBeenCalledWith();
    });
    // This is for compatibility with older versions of the signin widget. OKTA-304806
    it('clears legacy PKCE meta', () => {
      const clearStorage = jest.fn();
      jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
        clearStorage
      });
      transactionManager.clear();
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledTimes(2);
      expect(clearStorage).toHaveBeenCalledTimes(2);
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
      expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
    });
  });
  describe('save', () => {
    let setStorage;
    let getStorage;
    let meta;
    beforeEach(() => {
      createInstance();
      setStorage = jest.fn();
      getStorage = jest.fn();
      jest.spyOn(storageManager, 'getTransactionStorage').mockReturnValue({
        setStorage,
        getStorage
      });
      jest.spyOn(transactionManager, 'clear').mockReturnValue(null);
      meta = { codeVerifier: 'fake', redirectUri: 'http://localhost/fake' };
      transactionManager.save(meta);
    });
    it('saves to transaction storage', () => {
      expect(setStorage).toHaveBeenCalledWith(meta);
    });
    it('clears previous storage before save', () => {
      expect(transactionManager.clear).toHaveBeenCalledWith();
    });
  });
  describe('load', () => {
    let mockStorage;
    let meta;
    beforeEach(() => {
      createInstance();
      meta = { codeVerifier: 'fake', redirectUri: 'http://localhost/fake' };
      mockStorage = {
        setStorage: jest.fn(),
        getStorage: jest.fn().mockReturnValue(meta)
      };
      jest.spyOn(storageManager, 'getTransactionStorage').mockReturnValue(mockStorage);
      jest.spyOn(transactionManager, 'clear').mockReturnValue(null);
      transactionManager.save(meta);
    });
    it('can return the meta from transaction storage', () => {
      const res = transactionManager.load();
      expect(res.codeVerifier).toBe(meta.codeVerifier);
    });
    it('throws an error if meta cannot be found', () => {
      const fn = () => {
        mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
        transactionManager.load();
      };
      expect(fn).toThrowError('Could not load PKCE codeVerifier from storage');
    });

     // This is for compatibility with older versions of the signin widget. OKTA-304806
    describe('if no transaction data, try to load from legacy PKCE meta', () => {
      beforeEach(() => {
        mockStorage.getStorage = jest.fn().mockReturnValue({}); // no transaction data
      });

      it('try localStorage first', () => {
        const getStorage = jest.fn().mockReturnValue(meta);
        jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
          getStorage
        });
        const res = transactionManager.load();
        expect(res).toEqual(meta);
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenCalledWith({ storageType: 'localStorage' });
        expect(getStorage).toHaveBeenCalledTimes(1);
      });

      it('check sessionStorage if localStorage has no data', () => {
        const getStorage = jest.fn();
        getStorage.mockReturnValueOnce({
        });
        getStorage.mockReturnValueOnce(meta);
        jest.spyOn(storageManager, 'getLegacyPKCEStorage').mockReturnValue({
          getStorage
        });
        const res = transactionManager.load();
        expect(res).toEqual(meta);
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(1, { storageType: 'localStorage' });
        expect(storageManager.getLegacyPKCEStorage).toHaveBeenNthCalledWith(2, { storageType: 'sessionStorage' });
        expect(getStorage).toHaveBeenCalledTimes(2);
      });
    });
  });
});
