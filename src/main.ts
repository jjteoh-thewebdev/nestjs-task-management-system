import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { UnhandledExceptionsFilter } from './common/filters/unhandled-exception.filter'
import { HttpLogInterceptor } from './common/interceptors/http-log.interceptor'
import { HttpResponseInterceptor } from './common/interceptors/http-response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  const configService = app.get(ConfigService)

  const env = configService.get<string>(`NODE_ENV`) ?? `dev`
  const isProduction = env === `production`
  const httpPort = configService.get<number>(`PORT`) ?? 3000

  app.enableCors()
  app.enableShutdownHooks()
  app.enableVersioning({
    type: VersioningType.URI,
  })

  // pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: isProduction,
    }),
  )

  // filters
  const httpHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(new UnhandledExceptionsFilter(httpHost))
  app.useGlobalFilters(new HttpExceptionFilter())

  // interceptors
  app.useGlobalInterceptors(new HttpLogInterceptor())
  app.useGlobalInterceptors(new HttpResponseInterceptor())

  await app.listen(httpPort)

  console.log(`App is running`)
  console.log(`Environment: ${env}`)
  console.log(`Port: ${httpPort}`)
}
bootstrap()
