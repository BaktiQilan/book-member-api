import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from '../member.controller';
import { MemberService } from '../member.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MemberController', () => {
    let controller: MemberController;
    let service: MemberService;

    const mockMemberService = {
        findAll: jest.fn().mockResolvedValue([
            { id: 1, code: 'M001', name: 'John Doe' },
            { id: 2, code: 'M002', name: 'Jane Doe' },
        ]),
        findOne: jest.fn(),
        create: jest.fn(),
        getAllMembersWithBorrowedBooks: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberController],
            providers: [
                {
                    provide: MemberService,
                    useValue: mockMemberService,
                },
            ],
        }).compile();

        controller = module.get<MemberController>(MemberController);
        service = module.get<MemberService>(MemberService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllMembers', () => {
        it('should return an array of members', async () => {
            const result = await controller.getAllMembers();
            expect(result).toEqual([
                { id: 1, code: 'M001', name: 'John Doe' },
                { id: 2, code: 'M002', name: 'Jane Doe' },
            ]);
            expect(service.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getMemberById', () => {
        it('should return a member if found', async () => {
            const member = { id: 1, code: 'M001', name: 'John Doe' };
            mockMemberService.findOne.mockResolvedValue(member);

            expect(await controller.getMemberById({ id: 1 })).toEqual(member);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw a NotFoundException if member not found', async () => {
            mockMemberService.findOne.mockResolvedValue(null);

            await expect(controller.getMemberById({ id: 1 })).rejects.toThrow(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('createMember', () => {
        it('should create a new member', async () => {
            const createMemberDto = { code: 'M003', name: 'New Member' };
            const newMember = { id: 3, ...createMemberDto };
            mockMemberService.create.mockResolvedValue(newMember);

            expect(await controller.createMember(createMemberDto)).toEqual(newMember);
            expect(service.create).toHaveBeenCalledWith(createMemberDto);
        });

        it('should throw a BadRequestException if code or name is missing', async () => {
            const invalidDto = { code: '', name: '' };
            await expect(controller.createMember(invalidDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAllMembersWithBorrowedBooks', () => {
        it('should return all members with borrowed books', async () => {
            const borrowedBooksData = [
                {
                    memberId: 1,
                    memberName: 'John Doe',
                    borrowedBooks: [{ bookId: 1, bookTitle: 'Book 1' }],
                },
            ];
            mockMemberService.getAllMembersWithBorrowedBooks.mockResolvedValue(borrowedBooksData);

            expect(await controller.getAllMembersWithBorrowedBooks()).toEqual(borrowedBooksData);
            expect(service.getAllMembersWithBorrowedBooks).toHaveBeenCalledTimes(1);
        });
    });
});