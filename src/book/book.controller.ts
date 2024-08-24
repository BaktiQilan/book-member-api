import { Controller, Get } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Book } from './book.entity';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) { }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Return all books', type: [Book] })
  findAll() {
    return this.bookService.findAll();
  }
}