import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

// Definindo o cliente postgres para conexão com o banco
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Definindo o esquema de validação com zod para as credenciais
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Você pode ajustar a validação para a senha conforme necessário
});

// Função para buscar o usuário no banco de dados
async function getUser(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0]; // Retorna o usuário encontrado ou null
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validação das credenciais com zod
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          // Se a validação falhar, retorna null
          console.log('Invalid credentials format');
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Usando a função getUser para buscar o usuário no banco
        const user = await getUser(email);
        if (!user) {
          console.log('User not found');
          return null;
        }

        // Comparação de senha com bcrypt
        const passwordsMatch = await bcrypt.compare(password, user.password);
        
        if (passwordsMatch) {
          // Retorne o usuário sem a senha
          const { password, ...safeUser } = user;
          return safeUser;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
