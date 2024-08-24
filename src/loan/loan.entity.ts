import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Book } from '../book/book.entity';
import { Member } from '../member/member.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Book, (book) => book.loans)
  book: Book;

  @ManyToOne(() => Member, (member) => member.loans)
  member: Member;

  @Column({ type: 'timestamp' })
  borrowDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date;
}