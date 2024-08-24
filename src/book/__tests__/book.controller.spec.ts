import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from '../book.controller';
import { BookService } from '../book.service';
import { Book } from '../book.entity';

describe('BookController', () => {
    let controller: BookController;
    let service: BookService;

    const mockBookService = {
        findAll: jest.fn().mockResolvedValue([
            { id: 1, code: 'BK-1', title: 'Book 1', author: 'Author 1', stock: 1 },
            { id: 2, code: 'BK-2', title: 'Book 2', author: 'Author 2', stock: 1 },
        ]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BookController],
            providers: [
                {
                    provide: BookService,
                    useValue: mockBookService,
                },
            ],
        }).compile();

        controller = module.get<BookController>(BookController);
        service = module.get<BookService>(BookService);

        jest.clearAllMocks(); // Reset semua mock sebelum setiap tes
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of books', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([
                { id: 1, code: 'BK-1', title: 'Book 1', author: 'Author 1', stock: 1 },
                { id: 2, code: 'BK-2', title: 'Book 2', author: 'Author 2', stock: 1 },
            ]);
        });

        it('should call bookService.findAll once', async () => {
            await controller.findAll();
            expect(mockBookService.findAll).toHaveBeenCalledTimes(1);
        });
    });
});