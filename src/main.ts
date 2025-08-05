import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
  .setTitle('Nasiya savdo')
  .setDescription('The nasiya API description')
  .setVersion('1.0')
  .addSecurityRequirements("bearer",["bearer"])
  .addBearerAuth()
  .build()
const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3005,()=> {
    console.log("Server ishlamoqda");
    
  });
}
bootstrap();
    