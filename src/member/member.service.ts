import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) { }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Member> {
    return this.memberRepository.findOneBy({ id });
  }

  async create(createMemberDto: { code: string; name: string }): Promise<Member> {
    const newMember = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(newMember);
  }

  async getAllMembersWithBorrowedBooks() {

    const members = await this.memberRepository.find({
      relations: ['loans', 'loans.book'],
    });

    // Format data sesuai kebutuhan
    return members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      borrowedBooks: member.loans
        .filter(loan => loan.returnDate === null)
        .map(loan => ({
          bookId: loan.book.id,
          bookTitle: loan.book.title,
        })),
    }));
  }

}