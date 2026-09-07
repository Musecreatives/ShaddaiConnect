import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { JournalService } from './journal.service';

/** Public: the marketing site (shaddaicommunications.com/journal) reads posts/categories from
 * here. No auth — same content rendered on public pages either way. */
@Controller('journal')
export class PublicJournalController {
  constructor(private readonly journal: JournalService) {}

  @Get('categories')
  categories() {
    return this.journal.listCategories();
  }

  @Get('posts')
  posts(@Query('category') category?: string) {
    return this.journal.listPostsPublic(category);
  }

  @Get('posts/:slug')
  async post(@Param('slug') slug: string) {
    const post = await this.journal.getPostPublic(slug);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
