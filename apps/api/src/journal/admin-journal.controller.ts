import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JournalService } from './journal.service';

@Controller('admin/journal')
@UseGuards(JwtAuthGuard)
export class AdminJournalController {
  constructor(private readonly journal: JournalService) {}

  @Get('categories')
  listCategories() {
    return this.journal.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.journal.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.journal.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.journal.deleteCategory(id);
  }

  @Get('posts')
  listPosts() {
    return this.journal.listPostsAdmin();
  }

  @Get('posts/:id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.journal.getPostAdmin(id);
  }

  @Post('posts')
  createPost(@Body() dto: CreatePostDto) {
    return this.journal.createPost(dto);
  }

  @Patch('posts/:id')
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.journal.updatePost(id, dto);
  }

  @Delete('posts/:id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.journal.deletePost(id);
  }
}
