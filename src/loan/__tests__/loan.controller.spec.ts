import { Test, TestingModule } from '@nestjs/testing';
import { LoanController } from '../loan.controller';
import { LoanService } from '../loan.service';
import { Loan } from '../loan.entity';
import { BorrowBookDto, ReturnBookDto } from '../loan.dto';


describe('LoanController', () => {
    let controller: LoanController;
    let service: LoanService;

    // Mock data
    const mockLoan: Loan = {
        id: 1,
        member: {
            id: 1, code: 'M001', name: 'John Doe', penalty: false, penaltyEndDate: null, loans: []
        },
        book: {
            id: 1, code: 'B001', title: 'Book 1', stock: 5, author: '', loans: []
        },
        borrowDate: new Date(),
        returnDate: null,
    };

    const mockLoans: Loan[] = [mockLoan];

    const mockLoanService = {
        findAll: jest.fn().mockResolvedValue(mockLoans),
        borrowBook: jest.fn().mockResolvedValue(mockLoan),
        returnBook: jest.fn().mockResolvedValue(mockLoan),
        getBooksBorrowedByMembers: jest.fn().mockResolvedValue([
            {
                memberId: 1,
                memberName: 'John Doe',
                borrowedBooksCount: 1,
                books: [{ bookId: 1, bookTitle: 'Book 1' }],
            },
        ]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LoanController],
            providers: [
                { provide: LoanService, useValue: mockLoanService },
            ],
        }).compile();

        controller = module.get<LoanController>(LoanController);
        service = module.get<LoanService>(LoanService);
    });

    describe('getAllLoans', () => {
        it('should return all loans', async () => {
            await expect(controller.getAllLoans()).resolves.toEqual(mockLoans);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('borrowBook', () => {
        it('should successfully borrow a book', async () => {
            const dto: BorrowBookDto = { memberCode: 'M001', bookCode: 'B001' };
            await expect(controller.borrowBook(dto)).resolves.toEqual(mockLoan);
            expect(service.borrowBook).toHaveBeenCalledWith(dto.memberCode, dto.bookCode);
        });
    });

    describe('returnBook', () => {
        it('should successfully return a book', async () => {
            const dto: ReturnBookDto = { memberCode: 'M001', bookCode: 'B001' };
            await expect(controller.returnBook(dto)).resolves.toEqual(mockLoan);
            expect(service.returnBook).toHaveBeenCalledWith(dto.memberCode, dto.bookCode);
        });
    });

    describe('getBooksBorrowedByMembers', () => {
        it('should return list of members with borrowed books', async () => {
            await expect(controller.getBooksBorrowedByMembers()).resolves.toEqual([
                {
                    memberId: 1,
                    memberName: 'John Doe',
                    borrowedBooksCount: 1,
                    books: [{ bookId: 1, bookTitle: 'Book 1' }],
                },
            ]);
            expect(service.getBooksBorrowedByMembers).toHaveBeenCalled();
        });
    });
});