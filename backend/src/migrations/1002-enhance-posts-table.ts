import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhancePostsTable1002 implements MigrationInterface {
  name = 'EnhancePostsTable1002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add slug column with unique constraint
    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "slug" character varying(300) NOT NULL DEFAULT ''
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_posts_slug" ON "posts" ("slug")
    `);

    // Add category column
    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "category" character varying(100)
    `);

    // Add excerpt column
    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "excerpt" text
    `);

    // Add featured post support
    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "isFeatured" boolean NOT NULL DEFAULT false
    `);

    // Add view tracking
    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "viewCount" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "posts" ADD COLUMN "lastViewedAt" TIMESTAMP
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_category" ON "posts" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_isFeatured" ON "posts" ("isFeatured")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_viewCount" ON "posts" ("viewCount")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_slug_published" ON "posts" ("slug", "isPublished")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_posts_slug_published"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_viewCount"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_isFeatured"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_category"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "lastViewedAt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "viewCount"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "isFeatured"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "category"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_slug"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "slug"`);
  }
}
