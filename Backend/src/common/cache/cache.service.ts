import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public set(key: string, value: any, ttl = 0): Promise<void> {
    return this.cacheManager.set(key, value, ttl);
  }

  public async get(key: string): Promise<any> {
    const value = await this.cacheManager.get(key);
    return value;
  }

  public delete(key: string): Promise<void> {
    return this.cacheManager.del(key);
  }

  public clear(): Promise<void> {
    return this.cacheManager.reset();
  }
}
