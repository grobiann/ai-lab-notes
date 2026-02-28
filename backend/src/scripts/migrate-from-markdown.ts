import 'reflect-metadata';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { UserService } from '../services/UserService';
import { PostService } from '../services/PostService';
import { findMarkdownFiles, parseMarkdownFile, validateMarkdownFile } from '../utils/markdown';
import { AppDataSource as DB } from '../config/database';

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ file: string; errors: string[] }>;
}

async function migrateFromMarkdown() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    const userService = new UserService();
    const postService = new PostService();
    const tagRepository = DB.getRepository('Tag');

    // Get or create admin user
    let adminUser = await userService.getUserByUsername(config.admin.username);

    if (!adminUser) {
      console.log(`Creating admin user: ${config.admin.username}`);
      adminUser = await userService.createUser(
        config.admin.username,
        config.admin.email,
        config.admin.password,
        'admin'
      );
      console.log('✓ Admin user created');
    } else {
      console.log(`✓ Using existing admin user: ${config.admin.username}`);
    }

    // Find markdown files
    const markdownDir = path.join(process.cwd(), '..', 'docs', 'content', 'blog');
    console.log(`\nSearching for Markdown files in: ${markdownDir}`);

    const files = findMarkdownFiles(markdownDir);
    console.log(`Found ${files.length} Markdown files\n`);

    if (files.length === 0) {
      console.log(
        'No Markdown files found. Please check the directory path.'
      );
      await AppDataSource.destroy();
      return;
    }

    // Parse and migrate files
    const stats: MigrationStats = {
      total: files.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    console.log('Starting migration...\n');

    for (const file of files) {
      const parsed = parseMarkdownFile(file);

      if (!parsed) {
        console.log(`✗ Failed to parse: ${path.basename(file)}`);
        stats.failed++;
        continue;
      }

      const validationErrors = validateMarkdownFile(parsed);

      if (validationErrors.length > 0) {
        console.log(`✗ Validation failed: ${parsed.filename}`);
        stats.errors.push({
          file: parsed.filename,
          errors: validationErrors,
        });
        stats.failed++;
        continue;
      }

      try {
        // Check if post already exists by title
        const existing = await postService.getPostBySlug(
          parsed.frontmatter.slug || ''
        );

        if (existing) {
          console.log(`⊘ Skipped (already exists): ${parsed.frontmatter.title}`);
          stats.skipped++;
          continue;
        }

        // Create post
        const post = await postService.createPost(
          parsed.frontmatter.title,
          parsed.content,
          adminUser.id,
          parsed.frontmatter.description || parsed.excerpt,
          parsed.excerpt,
          parsed.frontmatter.category,
          parsed.frontmatter.published !== false,
          parsed.frontmatter.slug
        );

        // Add tags if provided
        if (parsed.frontmatter.tags && parsed.frontmatter.tags.length > 0) {
          for (const tagName of parsed.frontmatter.tags) {
            let tag = await tagRepository.findOne({
              where: { name: tagName },
            });

            if (!tag) {
              tag = tagRepository.create({ name: tagName });
              await tagRepository.save(tag);
            }

            if (post.tags) {
              post.tags.push(tag);
            } else {
              post.tags = [tag];
            }
          }

          await postRepository.save(post);
        }

        // Set featured if specified
        if (parsed.frontmatter.featured) {
          await postService.featurePost(post.id);
        }

        console.log(`✓ Migrated: ${parsed.frontmatter.title}`);
        stats.successful++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`✗ Error migrating ${parsed.filename}: ${errorMsg}`);
        stats.errors.push({
          file: parsed.filename,
          errors: [errorMsg],
        });
        stats.failed++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary');
    console.log('='.repeat(50));
    console.log(`Total files:     ${stats.total}`);
    console.log(`Successful:      ${stats.successful}`);
    console.log(`Failed:          ${stats.failed}`);
    console.log(`Skipped:         ${stats.skipped}`);

    if (stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      for (const error of stats.errors) {
        console.log(`  ${error.file}:`);
        for (const e of error.errors) {
          console.log(`    - ${e}`);
        }
      }
    }

    console.log('='.repeat(50) + '\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Get post repository for tagging
const postRepository = AppDataSource.getRepository('Post');

migrateFromMarkdown();
