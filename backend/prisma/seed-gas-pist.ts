import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Precios de Gas Natural en el PIST (Res. 1/2018), Secretaría de Energía.
// Monthly weighted-average price (precio_ppp) across all basins, USD/MMBtu.
const CSV_URL =
  'http://datos.energia.gob.ar/dataset/5ddbdfbb-b6f9-4bc1-9e71-0055e86cf552/resource/d87ca6ab-2979-474b-994a-e4ba259bb217/download/precios-de-gas-natural-.csv';
const SERIES = 'gas_pist';
const SOURCE = 'energia';

interface Row {
  anio: string;
  mes: string;
  cuenca: string;
  contrato: string;
  precio_ppp: string;
}

async function main() {
  const t0 = Date.now();
  const resp = await fetch(CSV_URL);
  if (!resp.ok) throw new Error(`datos.energia.gob.ar HTTP ${resp.status}`);
  const rows = parse(await resp.text(), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Row[];

  const points = rows
    .filter((r) => r.cuenca === 'Total Cuenca' && r.contrato === 'TOTAL')
    .map((r) => ({
      date: new Date(Date.UTC(Number(r.anio), Number(r.mes) - 1, 1)),
      value: Number(r.precio_ppp),
    }))
    .filter((p) => !Number.isNaN(p.date.getTime()) && Number.isFinite(p.value) && p.value > 0);

  if (!points.length) throw new Error('No Total Cuenca/TOTAL rows in PIST CSV');

  let upserted = 0;
  // Idempotent upsert by [source, series, date]. No TRUNCATE.
  for (const p of points) {
    await prisma.factPrice.upsert({
      where: { fact_price_source_series_date: { source: SOURCE, series: SERIES, date: p.date } },
      create: {
        source: SOURCE,
        series: SERIES,
        name: 'Gas natural PIST (promedio ponderado)',
        unit: 'USD/MMBtu',
        date: p.date,
        value: p.value,
      },
      update: { value: p.value },
    });
    upserted++;
  }

  const first = points[0].date.toISOString().slice(0, 7);
  const last = points[points.length - 1].date.toISOString().slice(0, 7);
  console.log(
    `  gas_pist: ${upserted} monthly rows upserted (${first}…${last}) in ${((Date.now() - t0) / 1000).toFixed(2)}s`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
