import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParsingErrorsController } from './parsing-errors.controller';
import { ParsingErrorsService } from './parsing-errors.service';
import { ParsingError } from './entities/parsing-error.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParsingError]),
    UsersModule,
  ],
  controllers: [ParsingErrorsController],
  providers: [ParsingErrorsService],
  exports: [ParsingErrorsService],
})
export class ParsingErrorsModule {}
