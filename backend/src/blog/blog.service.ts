import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreateBlogPostDto, UpdateBlogPostDto} from './dto/blog.dto'
import {Prisma} from '@prisma/client'

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateBlogPostDto) {
    // Check if slug already exists
    const existing = await this.prisma.blogPost.findUnique({
      where: {slug: createDto.slug},
    })

    if (existing) {
      throw new ConflictException(
        `Blog post with slug '${createDto.slug}' already exists`,
      )
    }

    const post = await this.prisma.blogPost.create({
      data: {
        title: createDto.title,
        slug: createDto.slug,
        content: createDto.content,
        excerpt: createDto.excerpt,
        authorId: userId,
        status: createDto.status || 'draft',
        visibility: createDto.visibility || 'public',
        featuredImage: createDto.featuredImage,
        tags: createDto.tags ? JSON.stringify(createDto.tags) : null,
        categories: createDto.categories
          ? JSON.stringify(createDto.categories)
          : null,
        publishedAt: createDto.publishedAt
          ? new Date(createDto.publishedAt)
          : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    return this.transformPost(post)
  }

  async findAll(query?: {
    status?: string
    visibility?: string
    authorId?: string
    tag?: string
    category?: string
    page?: number
    pagesize?: number
  }) {
    const {
      status,
      visibility,
      authorId,
      tag,
      category,
      page = 1,
      pagesize = 20,
    } = query || {}

    const where: Prisma.BlogPostWhereInput = {}

    if (status) {
      where.status = status
    }

    if (visibility) {
      where.visibility = visibility
    }

    if (authorId) {
      where.authorId = authorId
    }

    // For tag and category filtering, we need to use raw SQL or filter in memory
    // Since we store tags and categories as JSON strings

    const skip = (Number(page) - 1) * Number(pagesize)
    const take = Number(pagesize)

    let [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take,
        orderBy: {publishedAt: 'desc'},
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.blogPost.count({where}),
    ])

    // Filter by tag or category if specified
    if (tag) {
      posts = posts.filter(post => {
        if (!post.tags) return false
        const tags = JSON.parse(post.tags)
        return tags.includes(tag)
      })
      total = posts.length
    }

    if (category) {
      posts = posts.filter(post => {
        if (!post.categories) return false
        const categories = JSON.parse(post.categories)
        return categories.includes(category)
      })
      total = posts.length
    }

    return {
      data: posts.map(post => this.transformPost(post)),
      total,
      page: Number(page),
      pagesize: Number(pagesize),
    }
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: {id},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!post) {
      throw new NotFoundException(`Blog post with id ${id} not found`)
    }

    return this.transformPost(post)
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: {slug},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!post) {
      throw new NotFoundException(`Blog post with slug '${slug}' not found`)
    }

    return this.transformPost(post)
  }

  async update(id: string, userId: string, userRole: string, updateDto: UpdateBlogPostDto) {
    const post = await this.findOne(id)

    // Only the author or editor/owner can update
    if (post.author.id !== userId && !['editor', 'owner'].includes(userRole)) {
      throw new ForbiddenException('You can only edit your own blog posts')
    }

    // Check slug uniqueness if it's being changed
    if (updateDto.slug && updateDto.slug !== post.slug) {
      const existing = await this.prisma.blogPost.findUnique({
        where: {slug: updateDto.slug},
      })

      if (existing) {
        throw new ConflictException(
          `Blog post with slug '${updateDto.slug}' already exists`,
        )
      }
    }

    const data: any = {}

    if (updateDto.title !== undefined) data.title = updateDto.title
    if (updateDto.slug !== undefined) data.slug = updateDto.slug
    if (updateDto.content !== undefined) data.content = updateDto.content
    if (updateDto.excerpt !== undefined) data.excerpt = updateDto.excerpt
    if (updateDto.status !== undefined) data.status = updateDto.status
    if (updateDto.visibility !== undefined) data.visibility = updateDto.visibility
    if (updateDto.featuredImage !== undefined)
      data.featuredImage = updateDto.featuredImage
    if (updateDto.tags !== undefined)
      data.tags = JSON.stringify(updateDto.tags)
    if (updateDto.categories !== undefined)
      data.categories = JSON.stringify(updateDto.categories)
    if (updateDto.publishedAt !== undefined)
      data.publishedAt = new Date(updateDto.publishedAt)

    const updated = await this.prisma.blogPost.update({
      where: {id},
      data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    return this.transformPost(updated)
  }

  async remove(id: string, userId: string, userRole: string) {
    const post = await this.findOne(id)

    // Only the author or editor/owner can delete
    if (post.author.id !== userId && !['editor', 'owner'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own blog posts')
    }

    await this.prisma.blogPost.delete({
      where: {id},
    })

    return {message: 'Blog post deleted successfully'}
  }

  async getTags() {
    const posts = await this.prisma.blogPost.findMany({
      where: {status: 'published'},
      select: {tags: true},
    })

    const tagsSet = new Set<string>()

    posts.forEach(post => {
      if (post.tags) {
        const tags = JSON.parse(post.tags)
        tags.forEach((tag: string) => tagsSet.add(tag))
      }
    })

    return Array.from(tagsSet).sort()
  }

  async getCategories() {
    const posts = await this.prisma.blogPost.findMany({
      where: {status: 'published'},
      select: {categories: true},
    })

    const categoriesSet = new Set<string>()

    posts.forEach(post => {
      if (post.categories) {
        const categories = JSON.parse(post.categories)
        categories.forEach((category: string) => categoriesSet.add(category))
      }
    })

    return Array.from(categoriesSet).sort()
  }

  private transformPost(post: any) {
    return {
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      categories: post.categories ? JSON.parse(post.categories) : [],
    }
  }
}
