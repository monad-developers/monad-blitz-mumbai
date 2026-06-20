import type { DataRepository } from "./repository";
import { InMemoryRepository } from "./inMemoryRepository";
import { SqlRepository } from "./sqlRepository";
import { ENV } from "../config/env";

let singleton: DataRepository | null = null;

export function getRepository(): DataRepository {
  if (!singleton) {
    singleton = ENV.databaseUrl ? new SqlRepository() : new InMemoryRepository();
  }
  return singleton;
}

export function setRepository(repository: DataRepository): void {
  singleton = repository;
}
