import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../member/member.entity';
import { Book } from '../book/book.entity';
import { Loan } from './loan.entity';
import { IsNull } from "typeorm"

@Injectable()
export class LoanService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(Book)
        private bookRepository: Repository<Book>,
        @InjectRepository(Loan)
        private loanRepository: Repository<Loan>,
    ) { }

    async findAll(): Promise<Loan[]> {
        return this.loanRepository.find({
            relations: ['book', 'member'],
        });
    }

    async borrowBook(memberCode: string, bookCode: string): Promise<Loan> {
        const member = await this.memberRepository.findOneBy({ code: memberCode });
        if (!member) {
            throw new BadRequestException('Member not found');
        }

        if (await this.isInPenalty(member)) {
            throw new BadRequestException('Member is in penalty');
        }

        const book = await this.bookRepository.findOneBy({ code: bookCode });
        if (!book) {
            throw new BadRequestException('Book not found');
        }

        const alreadyBorrowed = await this.loanRepository.count({
            where: {
                member: member,
                book: book,
                returnDate: IsNull(),
            },
        });

        if (alreadyBorrowed) {
            throw new BadRequestException('Member has already borrowed this book and has not returned it');
        }

        // Cek jumlah pinjaman aktif untuk anggota
        const activeLoans = await this.loanRepository.count({
            where: {
                member: member,
                returnDate: IsNull(),
            },
        });

        if (activeLoans >= 2) {
            throw new BadRequestException('Member cannot borrow more than 2 books');
        }

        const borrowedLoans = await this.loanRepository.count({
            where: {
                book: book,
                returnDate: IsNull(),
            },
        });

        const availableStock = book.stock - borrowedLoans;

        if (availableStock <= 0) {
            throw new BadRequestException('No more book available, book is currently borrowed by another member');
        }

        book.stock -= 1;

        await this.bookRepository.save(book);

        const newLoan = this.loanRepository.create({
            member: member,
            book: book,
            borrowDate: new Date(),
        });

        return this.loanRepository.save(newLoan);
    }

    async returnBook(memberCode: string, bookCode: string): Promise<Loan> {
        const member = await this.memberRepository.findOneBy({ code: memberCode });
        if (!member) {
            throw new BadRequestException('Member not found');
        }

        const book = await this.bookRepository.findOneBy({ code: bookCode });
        if (!book) {
            throw new BadRequestException('Book not found');
        }

        const loan = await this.loanRepository.findOne({
            where: { member: member, book: book, returnDate: null },
        });

        if (!loan) {
            throw new BadRequestException('No active loan found for this book');
        }

        if (!loan.returnDate) {
            const returnDate = new Date();
            const borrowDate = loan.borrowDate;
            const daysBorrowed = Math.floor((returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));

            const penaltyDays = 7;
            if (daysBorrowed > penaltyDays) {
                // const penalty = daysBorrowed - penaltyDays;
                await this.applyPenalty(member);
            }

            book.stock += 1;
            await this.bookRepository.save(book);

            loan.returnDate = returnDate;
            return this.loanRepository.save(loan);
        } else {
            throw new BadRequestException('This book has already been returned');
        }
    }

    private async applyPenalty(member: Member): Promise<void> {
        const penaltyDuration = 3; // Penalty duration in days
        const penaltyEndDate = new Date();
        penaltyEndDate.setDate(penaltyEndDate.getDate() + penaltyDuration);

        member.penalty = true;
        member.penaltyEndDate = penaltyEndDate;
        await this.memberRepository.save(member);
    }

    private async isInPenalty(member: Member): Promise<boolean> {
        const now = new Date();

        // Cek jika ada penalti dan penalti masih aktif
        if (member.penaltyEndDate && member.penaltyEndDate > now) {
            return true;
        }

        // Reset status penalti jika penalti sudah berakhir
        if (member.penalty) {
            member.penalty = false;
            member.penaltyEndDate = null;
            await this.memberRepository.save(member);
        }
        return false;
    }

    async getBooksBorrowedByMembers(): Promise<any[]> {
        // Ambil semua pinjaman yang belum dikembalikan (returnDate IS NULL)
        const loans = await this.loanRepository.find({
            where: { returnDate: IsNull() },
            relations: ['member', 'book'],
        });

        const memberMap = new Map<number, { memberId: number, memberName: string, borrowedBooksCount: number, books: { bookId: number, bookTitle: string }[] }>();

        loans.forEach(loan => {
            const memberId = loan.member.id;
            const bookInfo = { bookId: loan.book.id, bookTitle: loan.book.title };

            if (!memberMap.has(memberId)) {
                memberMap.set(memberId, {
                    memberId: loan.member.id,
                    memberName: loan.member.name,
                    borrowedBooksCount: 1,
                    books: [bookInfo]
                });
            } else {
                const memberData = memberMap.get(memberId);
                memberData.borrowedBooksCount++;
                memberData.books.push(bookInfo);
            }
        });

        // // Gunakan reduce untuk menghitung jumlah buku yang sedang dipinjam oleh setiap member
        // const result = loans.reduce((acc, loan) => {
        //     const memberId = loan.member.id;
        //     if (!acc[memberId]) {
        //         acc[memberId] = { memberId: memberId, borrowedBooksCount: 0 };
        //     }
        //     acc[memberId].borrowedBooksCount++;
        //     return acc;
        // }, {});

        // Ubah hasil reduce menjadi array
        return Array.from(memberMap.values());
    }
}