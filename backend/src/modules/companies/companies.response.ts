import { ApiProperty } from '@nestjs/swagger';

export class CompanyListItemDto {
  @ApiProperty({ example: 'ypf' }) slug!: string;
  @ApiProperty({ example: 'YPF S.A.' }) name!: string;
  @ApiProperty({ example: 'oil_and_gas', enum: ['mining', 'oil_and_gas', 'both'] }) type!: string;
  @ApiProperty({ example: 'petroleum' }) sector!: string;
  @ApiProperty({ example: 'Argentina', nullable: true }) country!: string | null;
  @ApiProperty({ example: 'https://www.google.com/s2/favicons?domain=www.ypf.com&sz=64', nullable: true }) logo_url!: string | null;
  @ApiProperty({ example: 'YPF', nullable: true }) stock_ticker!: string | null;
  @ApiProperty({ example: 'NYSE', nullable: true }) stock_exchange!: string | null;
  @ApiProperty({ example: true }) is_public!: boolean;
  @ApiProperty({ example: 5725 }) project_count_oil_gas!: number;
  @ApiProperty({ example: 0 }) project_count_mining!: number;
  @ApiProperty({ example: 5725 }) project_count!: number;
  @ApiProperty({ type: [String], example: [] }) commodities!: string[];
  @ApiProperty({ type: [String], example: ['Chubut', 'Neuquén'] }) provinces!: string[];
  @ApiProperty({
    example: 0.327,
    nullable: true,
    type: 'number',
    description: 'Share of national BOE production, trailing 12 months. Null for non-producers.',
  })
  national_share_boe!: number | null;
}

export class CompanyStockDto {
  @ApiProperty({ example: 'YPF' }) ticker!: string;
  @ApiProperty({ example: 42.15, nullable: true }) price!: number | null;
  @ApiProperty({ example: 1.2, nullable: true }) change_pct!: number | null;
  @ApiProperty({ example: 0.5, nullable: true }) change!: number | null;
  @ApiProperty({ example: 'USD', nullable: true }) currency!: string | null;
  @ApiProperty({ example: 'NYSE', nullable: true }) exchange!: string | null;
  @ApiProperty({ example: '2026-05-29T20:00:00.000Z', nullable: true }) market_time!: string | null;
}

export class CompanyStockPriceRowDto {
  @ApiProperty({ example: 'ypf' }) slug!: string;
  @ApiProperty({ example: 'YPF S.A.' }) name!: string;
  @ApiProperty({ example: 'YPF' }) ticker!: string;
  @ApiProperty({ example: 42.15, nullable: true }) price!: number | null;
  @ApiProperty({ example: 1.2, nullable: true }) change_pct!: number | null;
  @ApiProperty({ example: 'NYSE', nullable: true }) exchange!: string | null;
}

export class StockHistoryPointDto {
  @ApiProperty({ example: '2026-05-01' }) date!: string;
  @ApiProperty({ example: 41.1, nullable: true }) open!: number | null;
  @ApiProperty({ example: 41.8, nullable: true }) high!: number | null;
  @ApiProperty({ example: 40.9, nullable: true }) low!: number | null;
  @ApiProperty({ example: 41.2, nullable: true }) close!: number | null;
  @ApiProperty({ example: 2500000, nullable: true }) volume!: number | null;
}

export class StockHistoryDto {
  @ApiProperty({ example: 'YPF' }) ticker!: string;
  @ApiProperty({ example: 'USD', nullable: true }) currency!: string | null;
  @ApiProperty({ example: 'NYQ', nullable: true }) exchange!: string | null;
  @ApiProperty({ example: 42.15, nullable: true }) current_price!: number | null;
  @ApiProperty({ example: 1.2, nullable: true }) change_pct!: number | null;
  @ApiProperty({ example: 53.4, nullable: true }) high_52w!: number | null;
  @ApiProperty({ example: 18.7, nullable: true }) low_52w!: number | null;
  @ApiProperty({ example: '1mo' }) range!: string;
  @ApiProperty({ example: '1d' }) interval!: string;
  @ApiProperty({ type: [StockHistoryPointDto] }) history!: StockHistoryPointDto[];
}

class CompanyCoordinatesDto {
  @ApiProperty({ example: -43.37, nullable: true }) lat!: number | null;
  @ApiProperty({ example: -68.688, nullable: true }) lng!: number | null;
}

export class CompanyProjectDto {
  @ApiProperty({ example: 'Cerro Solo' }) name!: string;
  @ApiProperty({ example: 'Uranio' }) commodity!: string;
  @ApiProperty({ example: 'Chubut', nullable: true }) province!: string | null;
  @ApiProperty({ example: 'Exploración avanzada', nullable: true }) status!: string | null;
  @ApiProperty({ type: CompanyCoordinatesDto }) coordinates!: CompanyCoordinatesDto;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' }, nullable: true, example: null })
  resources_summary!: Record<string, number> | null;
}

export class OilGasProductionSummaryDto {
  @ApiProperty({ example: 7327905.65, nullable: true }) oil_production_m3!: number | null;
  @ApiProperty({ example: 3541711.73, nullable: true }) gas_production_m3!: number | null;
  @ApiProperty({ example: 175295959.15, nullable: true }) boe_total!: number | null;
  @ApiProperty({ example: 5725 }) well_count!: number;
  @ApiProperty({ type: [String], example: ['Chubut', 'Neuquén'] }) provinces!: string[];
  @ApiProperty({
    example: 0.327,
    nullable: true,
    type: 'number',
    description: 'Share of national BOE production, trailing 12 months.',
  })
  national_share_boe!: number | null;
}

export class TimelineStageDto {
  @ApiProperty({ example: 'Exploración avanzada' }) stage!: string;
  @ApiProperty({ example: null, nullable: true }) date!: string | null;
}

export class CompanyDetailDto {
  @ApiProperty({ example: 'ypf' }) slug!: string;
  @ApiProperty({ example: 'YPF S.A.' }) name!: string;
  @ApiProperty({ example: 'oil_and_gas' }) type!: string;
  @ApiProperty({ example: 'petroleum' }) sector!: string;
  @ApiProperty({ example: 'Argentina', nullable: true }) country!: string | null;
  @ApiProperty({ example: 'https://www.ypf.com', nullable: true }) website!: string | null;
  @ApiProperty({ example: 'https://www.google.com/s2/favicons?domain=www.ypf.com&sz=64', nullable: true }) logo_url!: string | null;
  @ApiProperty({ example: 'YPF', nullable: true }) stock_ticker!: string | null;
  @ApiProperty({ example: 'NYSE', nullable: true }) stock_exchange!: string | null;
  @ApiProperty({ example: true }) is_public!: boolean;
  @ApiProperty({ type: [String], example: [] }) commodities_involved!: string[];
  @ApiProperty({ type: [String], example: ['Chubut', 'Neuquén'] }) provinces!: string[];
  @ApiProperty({ example: 5725 }) project_count_oil_gas!: number;
  @ApiProperty({ example: 0 }) project_count_mining!: number;
  @ApiProperty({ type: [CompanyProjectDto], description: 'Mineral project portfolio (empty for pure O&G operators).' }) projects!: CompanyProjectDto[];
  @ApiProperty({ type: [TimelineStageDto] }) project_timeline!: TimelineStageDto[];
  @ApiProperty({ type: OilGasProductionSummaryDto, nullable: true, description: 'Present for oil_and_gas / both companies.' }) oil_gas_production_summary!: OilGasProductionSummaryDto | null;
  @ApiProperty({ type: CompanyStockDto, nullable: true, description: 'Live quote for public companies, else null.' }) stock!: CompanyStockDto | null;
}
