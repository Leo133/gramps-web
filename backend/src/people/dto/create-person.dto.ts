import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ example: 'abc123def456', description: 'Unique handle' })
  @IsString()
  @IsNotEmpty()
  handle: string;

  @ApiProperty({ example: 'I0001', description: 'Gramps ID' })
  @IsString()
  @IsNotEmpty()
  grampsId: string;

  @ApiProperty({ example: 1, description: 'Gender: 0=Female, 1=Male, 2=Unknown' })
  @IsInt()
  @IsOptional()
  gender?: number;

  @ApiProperty({ example: false, description: 'Is private' })
  @IsBoolean()
  @IsOptional()
  private?: boolean;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Surname' })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({ example: 'Johnny', description: 'Call name' })
  @IsString()
  @IsOptional()
  callName?: string;

  @ApiProperty({ example: 'Dr.', description: 'Name prefix' })
  @IsString()
  @IsOptional()
  namePrefix?: string;

  @ApiProperty({ example: 'Jr.', description: 'Name suffix' })
  @IsString()
  @IsOptional()
  nameSuffix?: string;

  @ApiProperty({ example: 'CEO', description: 'Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '1980-01-01', description: 'Birth date' })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: 'New York', description: 'Birth place' })
  @IsString()
  @IsOptional()
  birthPlace?: string;

  @ApiProperty({ example: '2050-12-31', description: 'Death date' })
  @IsString()
  @IsOptional()
  deathDate?: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Death place' })
  @IsString()
  @IsOptional()
  deathPlace?: string;
}
