/**
 * Class to handle client side key value based storage.
 *  Storage Options: Local Storage (Browser Persistent) ,  Session Storage (Session Persistent) via constructor.
 *
 */
export declare class MDClientStorage implements IClientStorage {
    private _storageType;
    private _clientStorage;
    /**
     * Default Constructor of Client Storage which sets the value of Storage provider based on storage type specified.
     * storageType: option to choose between Local , Session and Index Db
     * preCache: this is available only in case of IndexDb. setting true loads the result set in a local variable for faster load times. Not recommended if the data set is large. default is false
     */
    constructor(storageType: StorageType, preCache?: boolean);
    /**
     * Gets the value from client storage. If expiration time was provided while setting will check and remove the item from session if date is passed.
     * @param key Key of the value to fetch
     */
    getItem(key: string): Promise<string>;
    /**
     *
     * @param key key of the value to be storage
     * @param value value to be stored
     * @param timeToExpireInMins (Optional) time to expire the value in minutes.
     */
    setItem(key: string, value: unknown, timeToExpireInMins?: number): void;
    /**
     * Clears the storage and empties all the values in the storage.
     */
    clear(): void;
    /**
     * Removes the key from storage
     * @param key key of the value to be removed
     */
    removeItem(key: string): void;
}
export declare enum StorageType {
    LocalStorage = 0,
    SessionStorage = 1,
    IndexedDb = 2
}
interface IClientStorage {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: unknown, timeToExpireInMins?: number): void;
    clear(): void;
    removeItem(key: string): void;
}
export {};
