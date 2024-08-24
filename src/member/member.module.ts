import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Loan } from '../loan/loan.entity';
import { Book } from '../book/book.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Member, Book, Loan]),  // Tambahkan Loan di sini
    ],
    providers: [MemberService],
    controllers: [MemberController],
    exports: [MemberService], // Jika MemberService dibutuhkan di modul lain
})
export class MemberModule { }