import {IsString, IsNumber, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreatePlaceDto {
  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  handle?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  grampsId?: string

  @ApiProperty({required: true})
  @IsString()
  name: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({required: false})
  @IsNumber()
  @IsOptional()
  latitude?: number

  @ApiProperty({required: false})
  @IsNumber()
  @IsOptional()
  longitude?: number

  @ApiProperty({required: false, description: 'JSON string for place_type'})
  @IsString()
  @IsOptional()
  placeType?: string

  @ApiProperty({required: false, description: 'JSON string for hierarchy'})
  @IsString()
  @IsOptional()
  hierarchy?: string
}

export class UpdatePlaceDto {
  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({required: false})
  @IsNumber()
  @IsOptional()
  latitude?: number

  @ApiProperty({required: false})
  @IsNumber()
  @IsOptional()
  longitude?: number

  @ApiProperty({required: false, description: 'JSON string for place_type'})
  @IsString()
  @IsOptional()
  placeType?: string

  @ApiProperty({required: false, description: 'JSON string for hierarchy'})
  @IsString()
  @IsOptional()
  hierarchy?: string
}

export class GeocodeQueryDto {
  @ApiProperty({required: true, description: 'Place name to geocode'})
  @IsString()
  query: string
}

export class ReverseGeocodeDto {
  @ApiProperty({required: true})
  @IsNumber()
  latitude: number

  @ApiProperty({required: true})
  @IsNumber()
  longitude: number
}
