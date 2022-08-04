/**
 * Class to handle client side key value based storage.
 *  Storage Options: Local Storage (Browser Persistent) ,  Session Storage (Session Persistent) via constructor.
 *
 */
 export class MDClientStorage implements IClientStorage {
    private _storageType: StorageType;
  
    private _clientStorage: IClientStorage | Storage;
  
    /**
     * Default Constructor of Client Storage which sets the value of Storage provider based on storage type specified.
     * storageType: option to choose between Local , Session and Index Db
     * preCache: this is available only in case of IndexDb. setting true loads the result set in a local variable for faster load times. Not recommended if the data set is large. default is false
     */
    constructor(storageType: StorageType, preCache?: boolean) {
      this._storageType = storageType;
  
      switch (storageType) {
        case StorageType.LocalStorage:
          this._clientStorage = window.localStorage;
          break;
        case StorageType.SessionStorage:
          this._clientStorage = window.sessionStorage;
          break;
        case StorageType.IndexedDb:
          this._clientStorage = new IndexedDbStorage(undefined, preCache);
          break;
      }
    }
  
    /**
     * Gets the value from client storage. If expiration time was provided while setting will check and remove the item from session if date is passed.
     * @param key Key of the value to fetch
     */
    public async getItem(key: string): Promise<string> {
      const stringValue = await this._clientStorage.getItem(key);
      if (stringValue !== null) {
        const value = JSON.parse(stringValue);
  
        //if the value has expiration date then return only if the expiration date has not passed.
        if (value.expirationDate) {
          const expirationDate = new Date(value.expirationDate);
          if (expirationDate > new Date()) {
            return JSON.stringify(value.value);
          } else {
            this._clientStorage.removeItem(key);
          }
        } else {
          return JSON.stringify(value);
        }
      }
      return null;
    }
  
    /**
     *
     * @param key key of the value to be storage
     * @param value value to be stored
     * @param timeToExpireInMins (Optional) time to expire the value in minutes.
     */
    public setItem(
      key: string,
      value: unknown,
      timeToExpireInMins?: number
    ): void {
      try {
        //if expiration is provided then add the expiration in the value
        if (timeToExpireInMins) {
          const expirationDate = new Date(
            new Date().getTime() + 60000 * timeToExpireInMins
          );
          const newValue = {
            value: value,
            expirationDate: expirationDate.toISOString(),
          };
          this._clientStorage.setItem(key, JSON.stringify(newValue));
        } else {
          this._clientStorage.setItem(key, JSON.stringify(value)); //set the value as it is if no expiration time is mentioned
        }
      } catch (error) {}
    }
  
    /**
     * Clears the storage and empties all the values in the storage.
     */
    public clear(): void {
      this._clientStorage.clear();
    }
  
    /**
     * Removes the key from storage
     * @param key key of the value to be removed
     */
    public removeItem(key: string): void {
      this._clientStorage.removeItem(key);
    }
  }
  
  export enum StorageType {
    LocalStorage,
    SessionStorage,
    IndexedDb,
  }
  
  interface IClientStorage {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: unknown, timeToExpireInMins?: number): void;
    clear(): void;
    removeItem(key: string): void;
  }
  
  class IndexedDbStorage implements IClientStorage {
    [name: string]: unknown;
    length: number=0;
    static _instance: IndexedDbStorage;
    private _indexedDb: IDBDatabase= null;
    private _CacheDb = 'CacheIndexDb'; //constant
    private readonly _CacheStore: string = 'CacheStore'; //constant
    private _CachedObjects: IIDbStorageObject[]; //property
    private _isCacheStoreLoaded = false; //property
    private _isPreCache = false;
  
    /**
     * Returns an instance of IndexedDbStorage , it has a singleton instance.
     * dbName: name of the Db to connect else default _CacheDb value will be selected.
     * preCache: preloads the result in an object.Not recommended if the data set in Indexed Db is large
     */
    constructor(dbName?: string, preCache?: boolean) {
      if (IndexedDbStorage._instance) {
        return IndexedDbStorage._instance;
      }
  
      this._CachedObjects = [];
      if (preCache) this._isPreCache = preCache;
  
      this.initialize(dbName);
  
      IndexedDbStorage._instance = this;
    }
  
    public clear(): void {
      const request = this.getCacheStore().clear();
      request.onsuccess = () => {
        // can use event if needed(event)
        this._CachedObjects = [];
      };
    }
    public async getItem(key: string): Promise<string> {
      //return the data from precache
      if (this._isPreCache) {
        if (!this._isCacheStoreLoaded) {
          await this.initialize(this._CacheDb);
        }
        const selectedItems = this._CachedObjects.filter((x) => x.name === key);
        return selectedItems.length > 0
          ? (selectedItems[0].value as string)
          : null;
      }
  
      //else return the data by getting the value from indexedDb
      return new Promise((resolve, reject) => {
        const objectRequest = this.getCacheStore().get(key);
        objectRequest.onsuccess = () => {
          if (objectRequest.result) resolve(objectRequest.result.value);
          else reject(Error('object not found'));
        };
      });
    }
  
    public key(index: number): string {
      return this._CachedObjects[index].value as string;
    }
    public removeItem(key: string, callback?: () => void): void {
      const request = this.getCacheStore().delete(key);
      request.onsuccess = () => {
        this._CachedObjects = this._CachedObjects.filter(
          (x) => x.name != key
        );
  
        if (callback) {
          callback();
        }
      };
    }
    public setItem(key: string, value: string): void {
      const request = this.getCacheStore().put({ name: key, value: value });
  
      request.onsuccess = () => {
        // can use event if needed(event)
        this.loadStorageCache();
      };
    }
  
    private initialize(dbName: string): Promise<boolean> {
      if (!dbName) {
        dbName = this._CacheDb;
      } else {
        this._CacheDb = dbName;
      }
  
      return new Promise((resolve, reject) => {
        const dbConnectionRequest = window.indexedDB.open(dbName, 1);
        dbConnectionRequest.onsuccess = () => {
          // can use event if needed(event: Event)
          this._indexedDb = dbConnectionRequest.result;
          this.loadStorageCache(resolve);
        };
  
        dbConnectionRequest.onerror = function () {
          // can use event if needed(event: Event)
          // Generic error handler for all errors targeted at this database's
          // requests!
          reject(false);
        };
  
        dbConnectionRequest.onupgradeneeded = () => {
          // can use event if needed(event: IDBVersionChangeEvent)
          // Save the IDBDatabase interface
          const db = dbConnectionRequest.result; //current connect request
  
          // Create an objectStore for this database
          //const objectStore =
          db.createObjectStore(this._CacheStore, {
            keyPath: 'name',
          });
        };
      });
    }
  
    private loadStorageCache(callback?: (isSuccess: boolean) => void) {
      if (this._isPreCache) {
        const request = this.getCacheStore().getAll();
  
        request.onsuccess = () => {
          // can use event if needed(event: Event)
          this._CachedObjects = request.result;
          this._isCacheStoreLoaded = true;
          if (callback) callback(true);
        };
      }
    }
  
    private getCacheStore(): IDBObjectStore {
      return this._indexedDb
        .transaction([this._CacheStore], 'readwrite')
        .objectStore(this._CacheStore);
    }
  }
  
  interface IIDbStorageObject {
    [name: string]: unknown;
    value: unknown;
  }
  