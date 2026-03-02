import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema';
import { nanoid } from 'nanoid';

// Create database connection directly without SvelteKit env
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

const { user, article, category, tag, articleCategory, articleTag } = schema;

async function seed() {
	console.log('🌱 Seeding database...');

	// Create sample users
	console.log('Creating users...');
	const [user1, user2, user3] = await db
		.insert(user)
		.values([
			{
				id: nanoid(),
				name: 'John Doe',
				email: 'john@newsdesk.example',
				emailVerified: true,
			},
			{
				id: nanoid(),
				name: 'Jane Smith',
				email: 'jane@newsdesk.example',
				emailVerified: true,
			},
			{
				id: nanoid(),
				name: 'Bob Johnson',
				email: 'bob@newsdesk.example',
				emailVerified: true,
			},
		])
		.returning();

	// Create categories
	console.log('Creating categories...');
	const [cat1, cat2, cat3] = await db
		.insert(category)
		.values([
			{
				id: nanoid(),
				name: 'Technology',
				slug: 'technology',
				description: 'Latest tech news and updates',
			},
			{
				id: nanoid(),
				name: 'Business',
				slug: 'business',
				description: 'Business and finance news',
			},
			{
				id: nanoid(),
				name: 'Politics',
				slug: 'politics',
				description: 'Political news and analysis',
			},
		])
		.returning();

	// Create tags
	console.log('Creating tags...');
	const [tag1, tag2, tag3, tag4] = await db
		.insert(tag)
		.values([
			{ id: nanoid(), name: 'Breaking', slug: 'breaking' },
			{ id: nanoid(), name: 'Featured', slug: 'featured' },
			{ id: nanoid(), name: 'Analysis', slug: 'analysis' },
			{ id: nanoid(), name: 'Interview', slug: 'interview' },
		])
		.returning();

	// Create articles
	console.log('Creating articles...');
	const articles = await db
		.insert(article)
		.values([
			{
				id: nanoid(),
				headline: 'Major Tech Company Announces Revolutionary AI Platform',
				slug: 'major-tech-company-ai-platform',
				body: 'A leading technology company has unveiled a groundbreaking artificial intelligence platform that promises to transform how businesses operate. The platform, developed over three years, combines machine learning, natural language processing, and computer vision capabilities into a unified system.',
				excerpt: 'New AI platform set to revolutionize business operations',
				status: 'published',
				priority: 'high',
				authorId: user1.id,
				publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
				wordCount: 850,
				featured: true,
			},
			{
				id: nanoid(),
				headline: 'Stock Market Reaches Record High Amid Economic Recovery',
				slug: 'stock-market-record-high',
				body: 'Global stock markets have surged to unprecedented levels as investors show renewed confidence in the economic recovery. Major indices have gained significantly, driven by strong corporate earnings and positive economic indicators.',
				excerpt: 'Markets celebrate economic recovery with record gains',
				status: 'published',
				priority: 'medium',
				authorId: user2.id,
				publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
				wordCount: 725,
			},
			{
				id: nanoid(),
				headline: 'Climate Summit Concludes with Landmark Agreement',
				slug: 'climate-summit-agreement',
				body: 'World leaders have reached a historic agreement at the international climate summit, committing to ambitious targets for reducing carbon emissions and transitioning to renewable energy sources.',
				excerpt: 'Global leaders unite on climate action',
				status: 'submitted',
				priority: 'urgent',
				authorId: user3.id,
				wordCount: 920,
			},
			{
				id: nanoid(),
				headline: 'Breakthrough in Cancer Research Shows Promise',
				slug: 'cancer-research-breakthrough',
				body: 'Researchers at a leading medical institute have discovered a novel approach to treating certain types of cancer, with early clinical trials showing remarkable success rates.',
				excerpt: 'New cancer treatment method shows extraordinary results',
				status: 'working',
				priority: 'high',
				authorId: user1.id,
				assignedTo: user1.id,
				wordCount: 650,
			},
			{
				id: nanoid(),
				headline: 'Space Agency Plans Ambitious Mars Mission',
				slug: 'mars-mission-announced',
				body: 'Space exploration enters a new era as the agency unveils plans for a crewed mission to Mars, scheduled for launch within the decade.',
				excerpt: 'Humanity prepares for historic journey to red planet',
				status: 'working',
				priority: 'medium',
				authorId: user2.id,
				assignedTo: user2.id,
				wordCount: 580,
			},
			{
				id: nanoid(),
				headline: 'Education Reform Bill Passes Legislative Review',
				slug: 'education-reform-bill',
				body: 'A comprehensive education reform bill aimed at modernizing curriculum and increasing funding for schools has successfully passed through legislative committees.',
				excerpt: 'Major education overhaul moves forward',
				status: 'submitted',
				priority: 'medium',
				authorId: user3.id,
				wordCount: 780,
			},
			{
				id: nanoid(),
				headline: 'Celebrity Tech Entrepreneur Announces New Venture',
				slug: 'entrepreneur-new-venture',
				body: 'A well-known entrepreneur has revealed plans for a new technology startup focused on sustainable energy solutions.',
				excerpt: 'Green tech gets high-profile backing',
				status: 'working',
				priority: 'low',
				authorId: user1.id,
				wordCount: 420,
			},
		])
		.returning();

	// Link articles to categories
	console.log('Linking articles to categories...');
	await db.insert(articleCategory).values([
		{ articleId: articles[0].id, categoryId: cat1.id },
		{ articleId: articles[1].id, categoryId: cat2.id },
		{ articleId: articles[2].id, categoryId: cat3.id },
		{ articleId: articles[3].id, categoryId: cat1.id },
		{ articleId: articles[4].id, categoryId: cat1.id },
		{ articleId: articles[5].id, categoryId: cat3.id },
		{ articleId: articles[6].id, categoryId: cat2.id },
	]);

	// Link articles to tags
	console.log('Linking articles to tags...');
	await db.insert(articleTag).values([
		{ articleId: articles[0].id, tagId: tag1.id },
		{ articleId: articles[0].id, tagId: tag2.id },
		{ articleId: articles[1].id, tagId: tag3.id },
		{ articleId: articles[2].id, tagId: tag1.id },
		{ articleId: articles[3].id, tagId: tag3.id },
		{ articleId: articles[4].id, tagId: tag2.id },
		{ articleId: articles[5].id, tagId: tag3.id },
		{ articleId: articles[6].id, tagId: tag4.id },
	]);

	console.log('✅ Database seeded successfully!');
	console.log(`Created ${articles.length} articles`);
	console.log(`Created ${[user1, user2, user3].length} users`);
	
	await client.end();
	process.exit(0);
}

seed().catch((error) => {
	console.error('❌ Error seeding database:', error);
	client.end().finally(() => process.exit(1));
});
