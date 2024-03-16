import type { IDBPDatabase } from "idb";
import { openDatabase } from "./connection";
import type { Schema } from "./schema";

export class DatabaseManager {
  initialized: Promise<void>;
  database!: IDBPDatabase<Schema>;

  persisted = true;
  persistenceMessageDismissed = false;

  constructor() {
    let markAsInitialized: () => void;
    this.initialized = new Promise((resolve) => {
      markAsInitialized = resolve;
    });

    if (typeof window === "undefined") return;

    if ("storage" in navigator) {
      navigator.storage
        .persisted()
        .then((persisted) => {
          this.persisted = persisted;
        })
        .catch(() => {});
    }

    openDatabase()
      .then((database) => {
        this.database = database;
        markAsInitialized();
      })
      .catch((error) => {
        console.error("Failed to open database:", error);
      });
  }

  async requestPersistence() {
    if ("chrome" in window) {
      await Notification.requestPermission();
    }

    if ("storage" in navigator) {
      this.persisted = await navigator.storage.persist();
    }
  }

  get shouldShowPersistenceWarning() {
    return !this.persisted && !this.persistenceMessageDismissed;
  }
}
