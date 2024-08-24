import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookService } from '../book.service';
import { Book } from '../book.entity';

describe('BookService', () => {
    let service: BookService;
    let repository: Repository<Book>;

    const mockBookRepository = {
        find: jest.fn().mockResolvedValue([
            { id: 1, code: 'BK-1', title: 'Book 1', author: 'Author 1', stock: 1 },
            { id: 2, code: 'BK-2', title: 'Book 2', author: 'Author 2', stock: 1 },
        ]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockBookRepository,
                },
            ],
        }).compile();

        service = module.get<BookService>(BookService);
        repository = module.get<Repository<Book>>(getRepositoryToken(Book));

        jest.clearAllMocks(); // Reset semua mock sebelum setiap tes
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of books', async () => {
            const books = await service.findAll();
            expect(books).toEqual([
                { id: 1, code: 'BK-1', title: 'Book 1', author: 'Author 1', stock: 1 },
                { id: 2, code: 'BK-2', title: 'Book 2', author: 'Author 2', stock: 1 },
            ]);
        });

        it('should call bookRepository.find once', async () => {
            await service.findAll();
            expect(mockBookRepository.find).toHaveBeenCalledTimes(1);
        });
    });
});