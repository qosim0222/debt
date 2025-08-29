import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { DebtModule } from './debt/debt.module';
import { PaymentModule } from './payment/payment.module';
import { MessageModule } from './message/message.module';
import { SampleModule } from './sample/sample.module';
import { AuthModule } from './auth/auth.module';
import { EskizService } from './eskiz/eskiz.service';

@Module({
  imports: [PrismaModule,  ConfigModule.forRoot({isGlobal:true}),
    ServeStaticModule.forRoot({
     rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
     AuthModule,
    UserModule,
    CustomerModule,
    DebtModule,
    PaymentModule,
    MessageModule,
    SampleModule,
    UploadModule,
   

  ],
  controllers: [AppController],
  providers: [AppService, EskizService],
})
export class AppModule {}
