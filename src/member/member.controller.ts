import { Controller, Get, Param, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { MemberService } from './member.service';
import { Member } from './member.entity';
import { CreateMemberDto, GetMemberDto } from './member.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('members')
@Controller('members')
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Get()
    @ApiOperation({ summary: 'Get all members' })
    @ApiResponse({ status: 200, description: 'Return all members', type: [Member] })
    async getAllMembers(): Promise<Member[]> {
        return await this.memberService.findAll();
    }

    @Post('getById')
    @ApiOperation({ summary: 'Get a member by ID' })
    @ApiBody({ description: 'ID of the member to fetch', type: GetMemberDto })
    @ApiResponse({ status: 200, description: 'Return the member', type: Member })
    @ApiResponse({ status: 404, description: 'Member not found' })
    async getMemberById(@Body() getMemberDto: GetMemberDto): Promise<Member> {
        const { id } = getMemberDto;
        const member = await this.memberService.findOne(id);
        if (!member) {
            throw new NotFoundException('Member not found');
        }
        return member;
    }

    @Post()
    @ApiOperation({ summary: 'Create a new member' })
    @ApiBody({ description: 'Member details to create', type: CreateMemberDto })
    @ApiResponse({ status: 201, description: 'Member created', type: Member })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async createMember(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
        const { code, name } = createMemberDto;
        if (!code || !name) {
            throw new BadRequestException('Code and name are required');
        }
        return await this.memberService.create({ code, name });
    }

    @Get('/borrowed-books')
    @ApiOperation({ summary: 'Get all members with borrowed books' })
    @ApiResponse({ status: 200, description: 'List of members with borrowed books' })
    async getAllMembersWithBorrowedBooks() {
        return this.memberService.getAllMembersWithBorrowedBooks();
    }

}