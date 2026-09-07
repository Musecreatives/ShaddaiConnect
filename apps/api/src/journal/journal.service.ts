import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const POST_INCLUDE = { category: true } satisfies Prisma.PostInclude;

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Categories ----------

  listCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    await this.assertSlugFree('category', dto.slug);
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    if (dto.slug) await this.assertSlugFree('category', dto.slug, id);
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    // Posts keep their categoryId set to NULL (onDelete: SetNull) rather than being deleted —
    // a removed category shouldn't take its posts down with it.
    await this.prisma.category.delete({ where: { id } });
    return { deleted: true as const };
  }

  // ---------- Posts (admin) ----------

  listPostsAdmin() {
    return this.prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      include: POST_INCLUDE,
    });
  }

  async getPostAdmin(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id }, include: POST_INCLUDE });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(dto: CreatePostDto) {
    await this.assertSlugFree('post', dto.slug);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    return this.prisma.post.create({
      data: {
        ...dto,
        publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined,
      },
      include: POST_INCLUDE,
    });
  }

  async updatePost(id: number, dto: UpdatePostDto) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');
    if (dto.slug) await this.assertSlugFree('post', dto.slug, id);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        publishAt:
          dto.publishAt === undefined ? undefined : dto.publishAt ? new Date(dto.publishAt) : null,
      },
      include: POST_INCLUDE,
    });
  }

  async deletePost(id: number) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');
    await this.prisma.post.delete({ where: { id } });
    return { deleted: true as const };
  }

  // ---------- Posts (public) ----------

  /** Published, or scheduled with a publishAt that has already passed — checked at read time so
   * a scheduled post goes live on its date without needing a cron job. */
  private visibleWhere(): Prisma.PostWhereInput {
    const now = new Date();
    return {
      OR: [{ status: 'published' }, { status: 'scheduled', publishAt: { lte: now } }],
    };
  }

  async listPostsPublic(categorySlug?: string) {
    return this.prisma.post.findMany({
      where: {
        ...this.visibleWhere(),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      orderBy: [{ featured: 'desc' }, { publishAt: 'desc' }, { createdAt: 'desc' }],
      include: POST_INCLUDE,
    });
  }

  async getPostPublic(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, ...this.visibleWhere() },
      include: POST_INCLUDE,
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ---------- helpers ----------

  private async assertSlugFree(kind: 'post' | 'category', slug: string, excludeId?: number) {
    const existing =
      kind === 'post'
        ? await this.prisma.post.findUnique({ where: { slug } })
        : await this.prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(`Slug "${slug}" is already in use`);
    }
  }

  private async assertCategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Category not found');
  }
}
