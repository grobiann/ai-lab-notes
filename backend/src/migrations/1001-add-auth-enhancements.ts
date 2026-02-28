import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthEnhancements1001 implements MigrationInterface {
  name = 'AddAuthEnhancements1001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to users table
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "emailVerified" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "verificationToken" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "verificationTokenExpiresAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "passwordResetToken" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "passwordResetTokenExpiresAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "lastPasswordChangeAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "refreshTokenBlacklist" text[] DEFAULT '{}'
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" SERIAL NOT NULL,
        "token" text NOT NULL,
        "userId" integer NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "userAgent" character varying(255),
        "ipAddress" character varying(45),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expiresAt" ON "refresh_tokens" ("expiresAt")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_token"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_expiresAt"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenBlacklist"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastPasswordChangeAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetTokenExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationTokenExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
  }
}
