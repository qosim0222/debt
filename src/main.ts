import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// import * as dotenv from 'dotenv';
// dotenv.config();

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
SwaggerModule.setup('api', app, documentFactory);

   const port = process.env.PORT || 3005;
  await app.listen(port, () => {
    console.log(`Server ${port}-portda ishlamoqda`);
  });
}
bootstrap();
    