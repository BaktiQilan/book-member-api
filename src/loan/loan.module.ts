import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { Member } from '../member/member.entity';
import { Book } from '../book/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Member, Book])],
  providers: [LoanService],
  controllers: [LoanController],
})
export class LoanModule {}