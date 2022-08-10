import indexedDB from 'fake-indexeddb';
window.indexedDB = indexedDB;

import { ClientStorage, StorageType } from "../clientSideStorage";


test('Adds a value in session Storage', () => {
  const clientSideStorage = new ClientStorage(StorageType.SessionStorage, true);
  clientSideStorage.setItem("testItem", "hello");
  expect(window.sessionStorage.getItem("testItem")).toBe("\"hello\"");
});

test('Adds a value in local Storage', () => {
  const clientSideStorage = new ClientStorage(StorageType.LocalStorage, true);
  clientSideStorage.setItem("testItem", "hello");
  expect(window.localStorage.getItem("testItem")).toBe("\"hello\"");
});

test('Adds a value in Indexed Db Storage', () => {
  const clientSideStorage = new ClientStorage(StorageType.IndexedDb, false);
  clientSideStorage.setItem("testItem", "hello");
  expect(clientSideStorage.getItem("testItem")).toBe("\"hello\"");
});