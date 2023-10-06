import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
// import { RedisOptions, Transport } from '@nestjs/microservices';
import * as http from 'http';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config(); 
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('YouApp API')
  .setDescription('API for register, login, user profile management, and chat user')
  .setVersion('1.0')
  .addTag('api')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const server = http.createServer(app.getHttpAdapter().getInstance());
  app.useWebSocketAdapter(new IoAdapter(server));

  await app.listen(3000);

}
bootstrap();