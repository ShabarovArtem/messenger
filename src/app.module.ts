import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/user/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { RolesGuard } from './shared/guards/roles.guard';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [CoreModule, UsersModule, AuthModule, MessagesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
