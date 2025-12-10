import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {FileInterceptor} from '@nestjs/platform-express'
import {ApiTags, ApiOperation, ApiConsumes, ApiResponse} from '@nestjs/swagger'
import {GrampsXmlService} from './gramps-xml.service'

@ApiTags('gramps-xml')
@Controller('api/gramps-xml')
export class GrampsXmlController {
  constructor(private readonly grampsXmlService: GrampsXmlService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({summary: 'Import Gramps XML file'})
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Import successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or import failed',
  })
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('overwrite') overwrite?: string | boolean,
    @Body('preserveHandles') preserveHandles?: string | boolean,
  ) {
    const result = await this.grampsXmlService.importGrampsXml(file.buffer, {
      overwrite: overwrite === true || overwrite === 'true',
      preserveHandles: preserveHandles === true || preserveHandles === 'true',
    })

    return result
  }

  @Get('export')
  @ApiOperation({summary: 'Export data to Gramps XML format'})
  @ApiResponse({
    status: 200,
    description: 'Export successful',
    type: String,
  })
  async exportFile(
    @Body('includeMedia') includeMedia?: string | boolean,
    @Body('includeLiving') includeLiving?: string | boolean,
  ) {
    const xml = await this.grampsXmlService.exportGrampsXml({
      includeMedia: includeMedia === true || includeMedia === 'true',
      includeLiving: includeLiving === true || includeLiving === 'true',
    })

    return {
      content: xml,
      filename: `gramps_export_${new Date().toISOString().split('T')[0]}.gramps`,
    }
  }
}
