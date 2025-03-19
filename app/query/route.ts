import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false }, // Ajuste SSL para evitar erros
});

async function listInvoices() {
  try {
    const data = await sql`
      SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.amount = 666;
    `;
    return data;
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    throw new Error('Erro ao buscar faturas');
  }
}

export async function GET() {
  try {
    const data = await listInvoices();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

