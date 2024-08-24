import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookModule } from './book/book.module';
import { MemberModule } from './member/member.module';
import { LoanModule } from './loan/loan.module';
import { Book } from './book/book.entity';
import { Member } from './member/member.entity';
import { Loan } from './loan/loan.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'db_book_api',
      entities: [Book, Member, Loan],
      synchronize: true, // Development only, do not use in production
      // logging: true,
    }),
    BookModule,
    MemberModule,
    LoanModule,
  ],
})
export class AppModule { }