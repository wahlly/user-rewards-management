import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';

const setupSwagger = (app: INestApplication, version: string, port: number): void => {
  const config = new DocumentBuilder()
    .setTitle('User Rewards Management API')
    .setDescription(
      'API for managing user achievements, badges, and cashback rewards.',
    )
    .addTag('Users', 'User management endpoints')
    .addTag('Purchases', 'Purchase management endpoints')
    .setVersion(version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(
    `Swagger docs available on http://localhost:${port}/api/docs`,
  );
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 7070;
  const version = '1.0';

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  setupSwagger(app, version, port);

  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}

bootstrap();
