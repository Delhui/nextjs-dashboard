import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import type { User } from '@/app/lib/definitions';
import bcrypt from "bcryptjs";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
        return user[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {

                // 1. 格式校验
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                // 2. 果校验成功，则
                if (parsedCredentials.success) {

                    // 3. 取值，查数据库
                    const { email, password } = parsedCredentials.data;

                    // 3.1. 现根据Email查数据库，如有返回用户信息，如果没有则返回空
                    const user = await getUser(email);
                    if (!user) return null;

                    // 3.2. 在根据数据库查到的密码，进行对比。如相同则返回成功，否则失败
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                // 3.3. 用户登陆失败
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
