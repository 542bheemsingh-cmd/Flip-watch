const DB_NAME = "flip-watch-pdf-reader";
const DB_VERSION = 1;
const STORES = ["settings", "documents", "bookmarks", "recent"];

let dbPromise;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function tx(store, mode, operation) {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const objectStore = transaction.objectStore(store);
    const request = operation(objectStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const storage = {
  async get(store, id) {
    return await tx(store, "readonly", (objectStore) => objectStore.get(id));
  },

  async set(store, value) {
    return await tx(store, "readwrite", (objectStore) => objectStore.put(value));
  },

  async delete(store, id) {
    return await tx(store, "readwrite", (objectStore) => objectStore.delete(id));
  },

  async all(store) {
    return await tx(store, "readonly", (objectStore) => objectStore.getAll());
  },

  async clear(store) {
    return await tx(store, "readwrite", (objectStore) => objectStore.clear());
  },
};

export async function makeDocumentId(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
