import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { TaskModule } from './tasks/task.module'
import { PrismaModule } from './prisma/prisma.module'
import { CommentModule } from './comments/comment.module'
import { CacheModule } from '@nestjs/cache-manager'
import * as cacheManager from 'cache-manager'
import * as IoRedisStore from 'cache-manager-ioredis'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          // dafault: limit 100 requests within 1 sec per ip
          ttl: config.get('THROTTLE_TTL') ?? 1000,
          limit: config.get('THROTTLE_LIMIT') ?? 100,
        },
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const ttl = configService.get<number>(`HTTP_CACHE_TTL`) || 5 // seconds
        const choiceOfCache = configService.get(`CACHE_STORE`) || `MEMORY`

        if (choiceOfCache === `REDIS`) {
          const connectionStr =
            configService.get(`REDIS_URL`) ||
            `redis://:password@127.0.0.1:6379/0`

          const parsedUrl = new URL(connectionStr)

          return {
            store: async () => {
              return await IoRedisStore.create({
                host: parsedUrl.hostname,
                port: parsedUrl.port,
                username: parsedUrl.username,
                password: parsedUrl.password,
                db: parsedUrl.pathname.substring(1) || 0,
                ttl: +ttl,
              })
            },
          }
        }

        // default to in-memory cache
        return cacheManager.caching('memory', {
          ttl: +ttl,
          max: 1000, // maximum number of items in cache
        })
      },
    }),
    PrismaModule,
    TaskModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
