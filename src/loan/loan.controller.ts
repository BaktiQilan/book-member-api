import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { LoanService } from './loan.service';
import { Loan } from './loan.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BorrowBookDto, ReturnBookDto } from './loan.dto';

@ApiTags('loans')
@Controller('loans')
export class LoanController {
    constructor(private readonly loanService: LoanService) { }

    @Get()
    @ApiOperation({ summary: 'Get all loans' })
    @ApiResponse({ status: 200, description: 'Return all loans', type: [Loan] })
    async getAllLoans(): Promise<Loan[]> {
        return await this.loanService.findAll();
    }

    @Post('borrow')
    @ApiOperation({ summary: 'Borrow a book' })
    @ApiBody({ description: 'Details to borrow a book', type: BorrowBookDto })
    @ApiResponse({ status: 201, description: 'Book successfully borrowed', type: Loan })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async borrowBook(@Body() body: BorrowBookDto): Promise<Loan> {
        const { memberCode, bookCode } = body;
        return await this.loanService.borrowBook(memberCode, bookCode);
    }

    @Post('return')
    @ApiOperation({ summary: 'Return a book' })
    @ApiBody({ description: 'Details to return a book', type: ReturnBookDto })
    @ApiResponse({ status: 201, description: 'Book successfully borrowed', type: Loan })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async returnBook(@Body() body: ReturnBookDto): Promise<Loan> {
        const { memberCode, bookCode } = body;
        return await this.loanService.returnBook(memberCode, bookCode);
    }

    @Get('borrowed-books-count')
    @ApiOperation({ summary: 'Get all borrowed books' })
    @ApiResponse({ status: 200, description: 'List of members with borrowed books' })
    async getBooksBorrowedByMembers() {
        return this.loanService.getBooksBorrowedByMembers();
    }
}