import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1000 implements MigrationInterface {
  name = 'InitialSchema1000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "username" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "bio" text,
        "avatarUrl" character varying(255),
        "role" character varying(50) NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "description" character varying(500),
        "authorId" integer NOT NULL,
        "publishedAt" TIMESTAMP,
        "isPublished" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_posts_authorId" FOREIGN KEY ("authorId") REFERENCES "users"("id"),
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL NOT NULL,
        "content" text NOT NULL,
        "postId" integer NOT NULL,
        "userId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comments_postId" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id"),
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_tags_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post_tags" (
        "postId" integer NOT NULL,
        "tagId" integer NOT NULL,
        CONSTRAINT "FK_post_tags_postId" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_tags_tagId" FOREIGN KEY ("tagId") REFERENCES "tags"("id"),
        CONSTRAINT "PK_post_tags" PRIMARY KEY ("postId", "tagId")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_posts_authorId" ON "posts" ("authorId")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_isPublished" ON "posts" ("isPublished")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_postId" ON "comments" ("postId")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_userId" ON "comments" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_comments_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_postId"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_isPublished"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_authorId"`);
    await queryRunner.query(`DROP TABLE "post_tags"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
