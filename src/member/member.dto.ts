import { ApiProperty } from '@nestjs/swagger';

export class GetMemberDto {
    @ApiProperty({ description: 'The ID of the member to fetch', example: 1 })
    id: number;
}

export class CreateMemberDto {
    @ApiProperty({ description: 'The Code of the member to create', example: 'M001' })
    code: string;

    @ApiProperty({ description: 'The Name of the member to create', example: 'Tatang Tango' })
    name: string;
}