import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppModule as DomainAppModule } from './app/app.module';
import { InfraModule } from './infra/infra.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './infra/http/exceptions/global-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/usersdb', {
      autoCreate: true
    }),
    DomainAppModule,
    InfraModule
  ]
})
class BootstrapModule {}

async function bootstrap() {
  const app = await NestFactory.create(BootstrapModule);
  app.setGlobalPrefix('/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('API para gestión de usuarios con arquitectura hexagonal')
    .setVersion('1.0')
    .addTag('users', 'Operaciones de usuarios')
    .addTag('auth', 'Autenticación y autorización')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log(`Users API running on port ${process.env.PORT || 3000}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/api`);
}
bootstrap();
