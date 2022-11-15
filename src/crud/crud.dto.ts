import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMongoId, IsOptional } from "class-validator";
import { parseStrObject } from "./crud.helper";

export class CrudDto {
  @ApiProperty({ type: [Object] })
  data: object[];

  @ApiProperty()
  total: string;
  @ApiProperty()
  lastPage: string;
  @ApiProperty()
  currentPage: string;
}

export class ICrudQuery {
  @ApiProperty({ required: false })
  @Transform((item) => parseStrObject(item))
  @IsOptional()
  readonly where?: string;

  @ApiProperty({ required: false })
  @Transform((item) => (isNaN(Number(item)) ? 10 : Number(item)))
  @IsOptional()
  readonly limit?: number;

  @ApiProperty({ required: false })
  @Transform((item) => Number(item) || 1)
  @IsOptional()
  readonly page?: number;

  @ApiProperty({ required: false })
  @Transform((item) => Number(item) || 1)
  @IsOptional()
  readonly skip?: number;

  @ApiProperty({ required: false })
  @Transform((item) => parseStrObject(item, true))
  @IsOptional()
  readonly sort?: string;

  @ApiProperty({ required: false })
  @Transform((item) => parseStrObject(item, true))
  @IsOptional()
  readonly populate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly select?: string;
}

export class CreateUpdateQueryDto {
  @ApiProperty({ required: false })
  @Transform((item) => parseStrObject(item, true))
  @IsOptional()
  readonly populate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  organization: string;
}

export class GetQuery {
  @ApiProperty({ required: false })
  @Transform((item) => parseStrObject(item, true))
  @IsOptional()
  readonly populate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly select?: string;
}

export class CrudPlaceholderDto {
  fake?: string;

  [key: string]: any;
}
