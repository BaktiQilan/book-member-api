import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ default: 1 })
  stock: number;

  @OneToMany(() => Loan, (loan) => loan.book)
  loans: Loan[];
}