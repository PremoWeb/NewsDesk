import postgres from 'postgres';
import { nanoid } from 'nanoid';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://root:mysecretpassword@localhost:5433/local';

const EMAIL = 'admin@newsdesk.local';
const PASSWORD = 'admin1234';
const NAME = 'Admin';

async function main() {
	const sql = postgres(DATABASE_URL);

	// Check if already exists
	const existing = await sql`SELECT id FROM "user" WHERE email = ${EMAIL}`;
	if (existing.length > 0) {
		const id = existing[0].id;
		await sql`UPDATE "user" SET role = 'admin' WHERE id = ${id}`;
		console.log('ℹ️  User already exists — role set to admin');
		console.log('   Email:   ', EMAIL);
		console.log('   Password: (unchanged — whatever you set previously)');
		await sql.end();
		return;
	}

	const userId = nanoid();
	const accountId = nanoid();
	const hash = await Bun.password.hash(PASSWORD, { algorithm: 'bcrypt', cost: 10 });
	const now = new Date();

	await sql`
		INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
		VALUES (${userId}, ${NAME}, ${EMAIL}, true, 'admin', ${now}, ${now})
	`;

	await sql`
		INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
		VALUES (${accountId}, ${userId}, 'credential', ${userId}, ${hash}, ${now}, ${now})
	`;

	console.log('✅ Admin account created:');
	console.log('   Email:   ', EMAIL);
	console.log('   Password:', PASSWORD);

	await sql.end();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
