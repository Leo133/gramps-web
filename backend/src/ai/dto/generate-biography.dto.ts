import {IsOptional, IsString, IsEnum, IsNumber, Min, Max} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export enum BiographyStyle {
  FORMAL = 'formal',
  NARRATIVE = 'narrative',
  CASUAL = 'casual',
  ACADEMIC = 'academic',
}

export class GenerateBiographyDto {
  @ApiProperty({
    description: 'Style of the biography',
    enum: BiographyStyle,
    default: BiographyStyle.NARRATIVE,
  })
  @IsOptional()
  @IsEnum(BiographyStyle)
  style?: BiographyStyle = BiographyStyle.NARRATIVE

  @ApiProperty({
    description: 'Target length in words',
    default: 500,
    minimum: 100,
    maximum: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(5000)
  length?: number = 500

  @ApiProperty({
    description: 'Include events in the biography',
    default: true,
  })
  @IsOptional()
  includeEvents?: boolean = true

  @ApiProperty({
    description: 'Include family relationships in the biography',
    default: true,
  })
  @IsOptional()
  includeFamily?: boolean = true

  @ApiProperty({
    description: 'Include places in the biography',
    default: true,
  })
  @IsOptional()
  includePlaces?: boolean = true

  @ApiProperty({
    description: 'Additional instructions for the AI',
    required: false,
  })
  @IsOptional()
  @IsString()
  customInstructions?: string
}
