import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private client = createClient({
    url: 'redis://127.0.0.1:6379',
  });

  async onModuleInit() {
    await this.client.connect();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, {
        EX: ttl,
      });
    } else {
      await this.client.set(key, value);
    }
  }
}
