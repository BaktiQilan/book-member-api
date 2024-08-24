import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ default: false })
  penalty: boolean;

  @Column({ type: 'timestamp', nullable: true })
  penaltyEndDate: Date;

  @OneToMany(() => Loan, (loan) => loan.member)
  loans: Loan[];
}