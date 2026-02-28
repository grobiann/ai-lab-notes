import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceCommentsTable1003 implements MigrationInterface {
  name = 'EnhanceCommentsTable1003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nested comment support (parent comment reference)
    await queryRunner.query(`
      ALTER TABLE "comments" ADD COLUMN "parentCommentId" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_parentCommentId"
      FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE CASCADE
    `);

    // Add moderation fields
    await queryRunner.query(`
      ALTER TABLE "comments" ADD COLUMN "isApproved" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "comments" ADD COLUMN "isSpam" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "comments" ADD COLUMN "moderationNote" text
    `);

    // Add like count field
    await queryRunner.query(`
      ALTER TABLE "comments" ADD COLUMN "likeCount" integer NOT NULL DEFAULT 0
    `);

    // Create comment_likes table for tracking individual likes
    await queryRunner.query(`
      CREATE TABLE "comment_likes" (
        "id" SERIAL NOT NULL,
        "commentId" integer NOT NULL,
        "userId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comment_likes_commentId" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comment_likes_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "PK_comment_likes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_comment_likes_unique" UNIQUE ("commentId", "userId")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_comments_parentCommentId" ON "comments" ("parentCommentId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comments_isApproved" ON "comments" ("isApproved")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comments_isSpam" ON "comments" ("isSpam")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comments_likeCount" ON "comments" ("likeCount")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_likes_commentId" ON "comment_likes" ("commentId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_likes_userId" ON "comment_likes" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_comment_likes_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_comment_likes_commentId"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_likeCount"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_isSpam"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_isApproved"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_parentCommentId"`);
    await queryRunner.query(`DROP TABLE "comment_likes"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "likeCount"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "moderationNote"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "isSpam"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "isApproved"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_parentCommentId"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "parentCommentId"`);
  }
}
