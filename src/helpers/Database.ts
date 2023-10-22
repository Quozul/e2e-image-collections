export default class Database<T> {
  private readonly dbName: string;
  private readonly dbVersion: number;
  private readonly storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, dbVersion: number, storeName: string) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error(request.error);
        reject();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const changeEvent = event as IDBVersionChangeEvent & {
          target: { result: IDBDatabase };
        };
        const db = changeEvent?.target?.result;
        db.createObjectStore(this.storeName, {
          keyPath: "id",
          autoIncrement: true,
        });
      };
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  create(data: T): Promise<IDBValidKey> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const request = store.add(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  getOne(id: IDBValidKey): Promise<T | null> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const transaction = this.db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result === undefined) {
          resolve(null);
        } else {
          resolve(request.result);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  getAll(): Promise<T[]> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const transaction = this.db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async update(id: IDBValidKey, data: Partial<T>): Promise<T> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const post = await this.getOne(id);

    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const request = store.put({ ...post, ...data });

    return new Promise(async (resolve, reject) => {
      request.onsuccess = async () => {
        const post = await this.getOne(id);
        resolve(post!);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async upsert(id: IDBValidKey, data: Partial<T>): Promise<T> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const post = (await this.getOne(id)) ?? {};

    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const request = store.put({ ...post, ...data });

    return new Promise(async (resolve, reject) => {
      request.onsuccess = async () => {
        const post = await this.getOne(id);
        resolve(post!);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(id: IDBValidKey): Promise<void> {
    if (this.db === null) {
      throw Error("Database is not initialized.");
    }

    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
