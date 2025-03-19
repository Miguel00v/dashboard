import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false }, // Ajuste SSL para evitar erros
});

async function listInvoices() {
  try {
    const data = await sql`
      SELECT * FROM invoices LIMIT 5;
    `;
    return data;
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    throw new Error(error.message);
  }
}

async function testConnection() {
  try {
    const result = await sql`SELECT 1+1 AS result`;
    console.log('Conexão bem-sucedida:', result);
    return { success: true, message: 'Conexão bem-sucedida' };
  } catch (error) {
    console.error('Erro na conexão:', error);
    return { success: false, error: error.message };
  }
}

export async function GET() {
  try {
    const testResult = await listInvoices();
    return Response.json(testResult);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

