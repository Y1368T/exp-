import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({
  imports: [CacheService],
  providers: [CacheService],
})
export class CacheModule {}
