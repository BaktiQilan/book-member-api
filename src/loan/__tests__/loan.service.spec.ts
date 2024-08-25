import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { BadRequestException } from '@nestjs/common';
import { LoanService } from '../loan.service';
import { Loan } from '../loan.entity';
import { Member } from '../../member/member.entity';
import { Book } from '../../book/book.entity';



describe('LoanService', () => {
    let service: LoanService;
    let loanRepository: Repository<Loan>;
    let memberRepository: Repository<Member>;
    let bookRepository: Repository<Book>;

    const mockLoanRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
    };

    const mockMemberRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
    };

    const mockBookRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoanService,
                {
                    provide: getRepositoryToken(Loan),
                    useValue: mockLoanRepository,
                },
                {
                    provide: getRepositoryToken(Member),
                    useValue: mockMemberRepository,
                },
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockBookRepository,
                },
            ],
        }).compile();

        service = module.get<LoanService>(LoanService);
        loanRepository = module.get<Repository<Loan>>(getRepositoryToken(Loan));
        memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
        bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));

        jest.clearAllMocks(); // Reset semua mock sebelum setiap tes
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of loans', async () => {
            const loans = [
                { id: 1, book: { id: 1, title: 'Book 1' }, member: { id: 1, name: 'Member 1' } },
                { id: 2, book: { id: 2, title: 'Book 2' }, member: { id: 2, name: 'Member 2' } },
            ];
            mockLoanRepository.find.mockResolvedValue(loans);

            const result = await service.findAll();
            expect(result).toEqual(loans);
            expect(loanRepository.find).toHaveBeenCalledWith({ relations: ['book', 'member'] });
        });
    });

    describe('isInPenalty', () => {
        it('should return true if member is in penalty period', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe', penalty: null, penaltyEndDate: null, loans: [] }
            member.penaltyEndDate = new Date(Date.now() + 1000); // 1 detik di masa depan

            jest.spyOn(memberRepository, 'save').mockResolvedValue(member); // Mock `save` method

            const result = await service['isInPenalty'](member); // Menggunakan bracket notation untuk memanggil method private
            expect(result).toBe(true);
        });

        it('should return false and reset penalty if penalty period is over', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe', penalty: null, penaltyEndDate: null, loans: [] }
            member.penalty = true;
            member.penaltyEndDate = new Date(Date.now() - 1000); // 1 detik di masa lalu

            const saveSpy = jest.spyOn(memberRepository, 'save').mockResolvedValue(member); // Mock `save` method

            const result = await service['isInPenalty'](member);
            expect(result).toBe(false);
            expect(member.penalty).toBe(false);
            expect(member.penaltyEndDate).toBe(null);
            expect(saveSpy).toHaveBeenCalledWith(member);
        });
    });

    describe('borrowBook - penalty check', () => {
        const member = { id: 1, code: 'M001', name: 'John Doe' };
        const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
        it('should throw BadRequestException if member is in penalty', async () => {
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            // Mocking isInPenalty method to return true
            jest.spyOn(service as any, 'isInPenalty').mockResolvedValue(true);

            await expect(service.borrowBook(member.code, book.code))
                .rejects
                .toThrow(new BadRequestException('Member is in penalty'));
        });

        it('should not throw BadRequestException if member is not in penalty', async () => {

            const newLoan = { id: 1, member: member, book: book, borrowDate: new Date() };
            // Mocking isInPenalty method to return false
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            jest.spyOn(service as any, 'isInPenalty').mockResolvedValue(false);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.count.mockResolvedValue(0) //cek buku sudah dipinjam oleh diri sendiri
            mockLoanRepository.count.mockResolvedValue(0) //cek jumlah pinjaman buku yang aktif
            mockLoanRepository.count.mockResolvedValue(0) //cek buku apakah tersedia
            mockBookRepository.save.mockResolvedValue({ ...book, stock: 4 });
            mockLoanRepository.create.mockReturnValue(newLoan);
            mockLoanRepository.save.mockResolvedValue(newLoan);

            await expect(service.borrowBook(member.code, book.code)).resolves.not.toThrow();
        });
    });

    describe('borrowBook', () => {
        it('should successfully borrow a book', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
            const newLoan = { id: 1, member: member, book: book, borrowDate: new Date() };

            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.count.mockResolvedValue(0) //cek buku sudah dipinjam oleh diri sendiri
            mockLoanRepository.count.mockResolvedValue(0) //cek jumlah pinjaman buku yang aktif
            mockLoanRepository.count.mockResolvedValue(0) //cek buku apakah tersedia
            mockBookRepository.save.mockResolvedValue({ ...book, stock: 4 });
            mockLoanRepository.create.mockReturnValue(newLoan);
            mockLoanRepository.save.mockResolvedValue(newLoan);

            const result = await service.borrowBook('M001', 'B001');
            expect(result).toEqual(newLoan);
            expect(mockMemberRepository.findOneBy).toHaveBeenCalledWith({ code: 'M001' });
            expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ code: 'B001' });
            expect(mockLoanRepository.count).toHaveBeenCalledTimes(3);
            expect(mockBookRepository.save).toHaveBeenCalledWith({ ...book, stock: 4 });
            expect(mockLoanRepository.create).toHaveBeenCalledWith({
                member: member,
                book: book,
                borrowDate: expect.any(Date),
            });
            expect(mockLoanRepository.save).toHaveBeenCalledWith(newLoan);
        });

        it('should throw BadRequestException if member is not found', async () => {
            mockMemberRepository.findOneBy.mockResolvedValue(null);

            await expect(service.borrowBook('M001', 'B001')).rejects.toThrow(BadRequestException);
            expect(memberRepository.findOneBy).toHaveBeenCalledWith({ code: 'M001' });
        });

        it('should throw BadRequestException if book is not found', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(null);

            await expect(service.borrowBook('M001', 'B001')).rejects.toThrow(BadRequestException);
            expect(bookRepository.findOneBy).toHaveBeenCalledWith({ code: 'B001' });
        });

        it('should throw BadRequestException if book is already borrowed', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.count.mockResolvedValue(1); // Already borrowed

            await expect(service.borrowBook('M001', 'B001')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if member has more than 2 active loans', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
            const loans = [
                { id: 1, member: member, book: book, borrowDate: new Date(), returnDate: IsNull() },
                { id: 2, member: member, book: book, borrowDate: new Date(), returnDate: IsNull() }
            ];

            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.count.mockResolvedValueOnce(0); // No loans for this book by this member
            mockLoanRepository.count.mockResolvedValueOnce(2); // Member has 2 active loans
            mockLoanRepository.count.mockResolvedValueOnce(0); // No loans for this book by others

            await expect(service.borrowBook('M001', 'B001')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if no stock available for the book', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 0 };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.count.mockResolvedValue(0); // No borrowed loans

            await expect(service.borrowBook('M001', 'B001')).rejects.toThrow(BadRequestException);
        });
    });

    describe('returnBook', () => {
        it('should successfully return a book', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe', penalty: false, penaltyEndDate: null };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
            const loan = { id: 1, member: member, book: book, borrowDate: new Date(), returnDate: null };

            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.findOne.mockResolvedValue(loan);
            mockBookRepository.save.mockResolvedValue({ ...book, stock: 6 });
            mockLoanRepository.save.mockResolvedValue({ ...loan, returnDate: new Date() });

            const result = await service.returnBook('M001', 'B001');
            expect(result).toEqual({ ...loan, returnDate: expect.any(Date) });
            expect(memberRepository.findOneBy).toHaveBeenCalledWith({ code: 'M001' });
            expect(bookRepository.findOneBy).toHaveBeenCalledWith({ code: 'B001' });
            expect(bookRepository.save).toHaveBeenCalledWith({ ...book, stock: 6 });
            expect(loanRepository.save).toHaveBeenCalledWith({ ...loan, returnDate: expect.any(Date) });
        });

        it('should throw BadRequestException if member is not found', async () => {
            mockMemberRepository.findOneBy.mockResolvedValue(null);

            await expect(service.returnBook('M001', 'B001')).rejects.toThrow(BadRequestException);
            expect(memberRepository.findOneBy).toHaveBeenCalledWith({ code: 'M001' });
        });

        it('should throw BadRequestException if book is not found', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(null);

            await expect(service.returnBook('M001', 'B001')).rejects.toThrow(BadRequestException);
            expect(bookRepository.findOneBy).toHaveBeenCalledWith({ code: 'B001' });
        });

        it('should throw BadRequestException if no active loan found', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1' };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.findOne.mockResolvedValue(null);

            await expect(service.returnBook('M001', 'B001')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if the book has already been returned', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            const book = { id: 1, code: 'B001', title: 'Book 1' };
            const loan = { id: 1, member: member, book: book, borrowDate: new Date(), returnDate: new Date() };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.findOne.mockResolvedValue(loan);

            await expect(service.returnBook('M001', 'B001')).rejects.toThrow(BadRequestException);
        });

        it('should apply penalty if book is returned late', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe', penalty: false, penaltyEndDate: null };
            const book = { id: 1, code: 'B001', title: 'Book 1', stock: 5 };
            const loan = { id: 1, member: member, book: book, borrowDate: new Date(new Date().setDate(new Date().getDate() - 10)), returnDate: null };
            mockMemberRepository.findOneBy.mockResolvedValue(member);
            mockBookRepository.findOneBy.mockResolvedValue(book);
            mockLoanRepository.findOne.mockResolvedValue(loan);
            mockBookRepository.save.mockResolvedValue({ ...book, stock: 6 });
            mockLoanRepository.save.mockResolvedValue({ ...loan, returnDate: new Date() });

            await service.returnBook('M001', 'B001');
            expect(memberRepository.save).toHaveBeenCalledWith({
                ...member,
                penalty: true,
                penaltyEndDate: expect.any(Date),
            });
        });
    });

    describe('getBooksBorrowedByMembers', () => {
        it('should return the books borrowed by each member', async () => {
            const loans = [
                { member: { id: 1, name: 'Member 1' }, book: { id: 1, title: 'Book 1' } },
                { member: { id: 1, name: 'Member 1' }, book: { id: 2, title: 'Book 2' } },
                { member: { id: 2, name: 'Member 2' }, book: { id: 3, title: 'Book 3' } },
            ];

            mockLoanRepository.find.mockResolvedValue(loans);

            const result = await service.getBooksBorrowedByMembers();
            expect(result).toEqual([
                {
                    memberId: 1,
                    memberName: 'Member 1',
                    borrowedBooksCount: 2,
                    books: [
                        { bookId: 1, bookTitle: 'Book 1' },
                        { bookId: 2, bookTitle: 'Book 2' },
                    ],
                },
                {
                    memberId: 2,
                    memberName: 'Member 2',
                    borrowedBooksCount: 1,
                    books: [{ bookId: 3, bookTitle: 'Book 3' }],
                },
            ]);
        });
    });
});