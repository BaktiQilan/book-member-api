import { ApiProperty } from '@nestjs/swagger';

export class BorrowBookDto {
    @ApiProperty({ description: 'The memberCode of the member to borrow a book', example: 'M001' })
    memberCode: string;

    @ApiProperty({ description: 'The bookCode of the book', example: 'JK-45' })
    bookCode: string;
}
export class ReturnBookDto {
    @ApiProperty({ description: 'The memberCode of the member to return a book', example: 'M001' })
    memberCode: string;

    @ApiProperty({ description: 'The bookCode of the book', example: 'JK-45' })
    bookCode: string;
}