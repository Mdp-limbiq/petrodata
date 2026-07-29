import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export const SORT_VALUES = ['oil_m3', 'gas_thousand_m3', 'boe', 'active_wells'] as const;
export type OperatorSort = (typeof SORT_VALUES)[number];

export class ListOperatorsQueryDto {
  @ApiPropertyOptional({
    enum: SORT_VALUES,
    default: 'boe',
    description: 'Sort key for the latest-month totals.',
  })
  @IsOptional() @IsIn(SORT_VALUES as unknown as string[])
  sort?: OperatorSort = 'boe';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional() @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

export class OperatorProductionQueryDto {
  @ApiPropertyOptional({ example: '2026-01', description: 'Inclusive lower bound (YYYY-MM or YYYY-MM-DD).' })
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}(-\d{2})?$/)
  from?: string;

  @ApiPropertyOptional({ example: '2026-04', description: 'Inclusive upper bound (YYYY-MM or YYYY-MM-DD).' })
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}(-\d{2})?$/)
  to?: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'Trailing N months relative to the latest data month. Ignored when `from` is set.',
  })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(600)
  months?: number;
}

export class OperatorsProductionBatchQueryDto {
  @ApiProperty({
    example: 'ypf,vista-energy',
    description: 'Comma-separated operator slugs (max 10).',
  })
  @IsString() @Matches(/^[\w-]+(,[\w-]+){0,9}$/)
  slugs!: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'Trailing N months relative to the latest data month.',
  })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(600)
  months?: number;
}
