import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from '../member.service';
import { Member } from '../member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MemberService', () => {
    let service: MemberService;
    let repository: Repository<Member>;

    const mockRepository = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemberService,
                {
                    provide: getRepositoryToken(Member),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MemberService>(MemberService);
        repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of members', async () => {
            const members = [
                { id: 1, code: 'M001', name: 'John Doe' },
                { id: 2, code: 'M002', name: 'Jane Doe' },
            ];
            mockRepository.find.mockResolvedValue(members);

            const result = await service.findAll();
            expect(result).toEqual(members);
            expect(repository.find).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('should return a member if found', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            mockRepository.findOneBy.mockResolvedValue(member);

            const result = await service.findOne(1);
            expect(result).toEqual(member);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });
    });

    describe('create', () => {
        it('should create and save a new member', async () => {
            const createMemberDto = { code: 'M003', name: 'New Member' };
            const newMember = { id: 3, ...createMemberDto };

            mockRepository.create.mockReturnValue(newMember);
            mockRepository.save.mockResolvedValue(newMember);

            const result = await service.create(createMemberDto);
            expect(result).toEqual(newMember);
            expect(repository.create).toHaveBeenCalledWith(createMemberDto);
            expect(repository.save).toHaveBeenCalledWith(newMember);
        });
    });

    describe('getAllMembersWithBorrowedBooks', () => {
        it('should return all members with borrowed books', async () => {
            const members = [
                {
                    id: 1,
                    name: 'John Doe',
                    loans: [
                        {
                            id: 1,
                            book: { id: 1, title: 'Book 1' },
                            returnDate: null,
                        },
                    ],
                },
            ];

            mockRepository.find.mockResolvedValue(members);

            const result = await service.getAllMembersWithBorrowedBooks();
            expect(result).toEqual([
                {
                    memberId: 1,
                    memberName: 'John Doe',
                    borrowedBooks: [{ bookId: 1, bookTitle: 'Book 1' }],
                },
            ]);
            expect(repository.find).toHaveBeenCalledWith({ relations: ['loans', 'loans.book'] });
        });
    });
});