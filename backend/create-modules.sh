#!/bin/bash

# Script to create remaining resource modules using templates

MODULES=("families" "events" "places" "media" "repositories" "sources" "notes" "metadata" "tree-settings")

for module in "${MODULES[@]}"; do
  MODULE_NAME="$(echo $module | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g' | sed 's/ //g')"
  MODULE_PATH="/home/runner/work/gramps-web/gramps-web/backend/src/$module"
  
  # Create module file
  cat > "$MODULE_PATH/${module}.module.ts" << MODEOF
import {Module} from '@nestjs/common'
import {${MODULE_NAME}Service} from './${module}.service'
import {${MODULE_NAME}Controller} from './${module}.controller'

@Module({
  controllers: [${MODULE_NAME}Controller],
  providers: [${MODULE_NAME}Service],
  exports: [${MODULE_NAME}Service],
})
export class ${MODULE_NAME}Module {}
MODEOF

  # Create basic service
  cat > "$MODULE_PATH/${module}.service.ts" << SVCEOF
import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class ${MODULE_NAME}Service {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return []
  }

  async findOne(handle: string) {
    return {}
  }

  async create(data: any) {
    return {}
  }

  async update(handle: string, data: any) {
    return {}
  }

  async remove(handle: string) {
    return {message: 'Deleted successfully'}
  }
}
SVCEOF

  # Create basic controller
  cat > "$MODULE_PATH/${module}.controller.ts" << CTLEOF
import {Controller, Get, Post, Put, Delete, Body, Param} from '@nestjs/common'
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger'
import {${MODULE_NAME}Service} from './${module}.service'

@ApiTags('${MODULE_NAME}')
@ApiBearerAuth('JWT-auth')
@Controller('api/${module}')
export class ${MODULE_NAME}Controller {
  constructor(private readonly service: ${MODULE_NAME}Service) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':handle')
  findOne(@Param('handle') handle: string) {
    return this.service.findOne(handle)
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data)
  }

  @Put(':handle')
  update(@Param('handle') handle: string, @Body() data: any) {
    return this.service.update(handle, data)
  }

  @Delete(':handle')
  remove(@Param('handle') handle: string) {
    return this.service.remove(handle)
  }
}
CTLEOF

done

echo "Modules created successfully"
