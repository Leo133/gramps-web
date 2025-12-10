import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {ConfigService} from '@nestjs/config'

// Constants for face recognition
const MAX_MEDIA_BATCH_SIZE = 100
const DEFAULT_FACE_CONFIDENCE_MIN = 0.85
const DEFAULT_FACE_CONFIDENCE_MAX = 1.0

interface FaceDetection {
  faceId: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
}

interface FaceTag {
  faceId: string
  personHandle: string
  personName: string
  confidence: number
  taggedAt: string
}

@Injectable()
export class FaceRecognitionService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Detect faces in a photo
   */
  async detectFaces(mediaHandle: string) {
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException(`Media with handle ${mediaHandle} not found`)
    }

    // Perform face detection (mock implementation)
    const faces = await this.performFaceDetection(media)

    // Save face detection results
    await this.saveFaceDetections(mediaHandle, faces)

    return {
      mediaHandle,
      facesDetected: faces.length,
      faces,
      detectedAt: new Date().toISOString(),
    }
  }

  /**
   * Tag a detected face with a person
   */
  async tagFace(mediaHandle: string, faceId: string, personHandle: string) {
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException(`Media with handle ${mediaHandle} not found`)
    }

    const person = await this.prisma.person.findUnique({
      where: {handle: personHandle},
    })

    if (!person) {
      throw new NotFoundException(
        `Person with handle ${personHandle} not found`,
      )
    }

    // Get existing face detections
    const metadata = await this.prisma.metadata.findFirst({
      where: {key: `face_detections_${mediaHandle}`},
    })

    if (!metadata) {
      throw new NotFoundException('No face detections found for this media')
    }

    const detections = JSON.parse(metadata.value)
    const face = detections.faces.find((f: any) => f.faceId === faceId)

    if (!face) {
      throw new NotFoundException(`Face with ID ${faceId} not found`)
    }

    // Save face tag
    const tag: FaceTag = {
      faceId,
      personHandle,
      personName: `${person.firstName || ''} ${person.surname || ''}`.trim(),
      confidence: 1.0, // Manual tag = 100% confidence
      taggedAt: new Date().toISOString(),
    }

    await this.saveFaceTag(mediaHandle, tag)

    return {
      mediaHandle,
      faceId,
      personHandle,
      personName: tag.personName,
      success: true,
    }
  }

  /**
   * Get all face tags for a media file
   */
  async getFaceTags(mediaHandle: string) {
    const media = await this.prisma.media.findUnique({
      where: {handle: mediaHandle},
    })

    if (!media) {
      throw new NotFoundException(`Media with handle ${mediaHandle} not found`)
    }

    // Get face detections
    const detectionsMetadata = await this.prisma.metadata.findFirst({
      where: {key: `face_detections_${mediaHandle}`},
    })

    const detections = detectionsMetadata
      ? JSON.parse(detectionsMetadata.value).faces
      : []

    // Get face tags
    const tagsMetadata = await this.prisma.metadata.findFirst({
      where: {key: `face_tags_${mediaHandle}`},
    })

    const tags = tagsMetadata ? JSON.parse(tagsMetadata.value).tags : []

    // Combine detections and tags
    const facesWithTags = detections.map((face: FaceDetection) => {
      const tag = tags.find((t: FaceTag) => t.faceId === face.faceId)
      return {
        ...face,
        tag: tag || null,
      }
    })

    return {
      mediaHandle,
      facesDetected: detections.length,
      facesTagged: tags.length,
      faces: facesWithTags,
    }
  }

  /**
   * Auto-tag faces using face recognition
   */
  async autoTagFaces(mediaHandle?: string) {
    let mediaList: any[]

    if (mediaHandle) {
      // Process single media file
      const media = await this.prisma.media.findUnique({
        where: {handle: mediaHandle},
      })

      if (!media) {
        throw new NotFoundException(
          `Media with handle ${mediaHandle} not found`,
        )
      }

      mediaList = [media]
    } else {
      // Process all media with photos
      mediaList = await this.prisma.media.findMany({
        where: {
          mimeType: {
            startsWith: 'image/',
          },
        },
        take: MAX_MEDIA_BATCH_SIZE,
      })
    }

    const results = []

    for (const media of mediaList) {
      // Detect faces
      const detections = await this.detectFaces(media.handle)

      // Auto-tag faces (mock implementation)
      const autoTags = await this.performAutoTagging(
        media.handle,
        detections.faces,
      )

      results.push({
        mediaHandle: media.handle,
        facesDetected: detections.faces.length,
        facesAutoTagged: autoTags.length,
      })
    }

    return {
      mediaProcessed: mediaList.length,
      totalFacesDetected: results.reduce((sum, r) => sum + r.facesDetected, 0),
      totalFacesAutoTagged: results.reduce(
        (sum, r) => sum + r.facesAutoTagged,
        0,
      ),
      results,
    }
  }

  /**
   * Perform face detection (mock implementation)
   */
  private async performFaceDetection(media: any): Promise<FaceDetection[]> {
    // In production, this would use face-api.js, AWS Rekognition, or similar
    // For now, return mock data

    const numFaces = Math.floor(Math.random() * 4) // 0-3 faces

    const faces: FaceDetection[] = []

    for (let i = 0; i < numFaces; i++) {
      faces.push({
        faceId: `face_${media.handle}_${i}`,
        boundingBox: {
          x: Math.random() * 0.5,
          y: Math.random() * 0.5,
          width: 0.2 + Math.random() * 0.1,
          height: 0.2 + Math.random() * 0.1,
        },
        confidence:
          DEFAULT_FACE_CONFIDENCE_MIN +
          Math.random() *
            (DEFAULT_FACE_CONFIDENCE_MAX - DEFAULT_FACE_CONFIDENCE_MIN),
      })
    }

    return faces
  }

  /**
   * Perform auto-tagging of faces (mock implementation)
   */
  private async performAutoTagging(
    _mediaHandle: string,
    _faces: FaceDetection[],
  ): Promise<FaceTag[]> {
    // In production, this would use face recognition to match against known people
    // For now, return empty array (manual tagging only)

    // Could implement by:
    // 1. Get all people with photos
    // 2. Extract face embeddings from their photos
    // 3. Compare with detected faces
    // 4. Auto-tag if similarity > threshold

    return []
  }

  /**
   * Save face detection results
   */
  private async saveFaceDetections(
    mediaHandle: string,
    faces: FaceDetection[],
  ) {
    const data = {
      faces,
      detectedAt: new Date().toISOString(),
    }

    const existing = await this.prisma.metadata.findFirst({
      where: {key: `face_detections_${mediaHandle}`},
    })

    if (existing) {
      await this.prisma.metadata.update({
        where: {id: existing.id},
        data: {value: JSON.stringify(data)},
      })
    } else {
      await this.prisma.metadata.create({
        data: {
          key: `face_detections_${mediaHandle}`,
          value: JSON.stringify(data),
        },
      })
    }
  }

  /**
   * Save face tag
   */
  private async saveFaceTag(mediaHandle: string, tag: FaceTag) {
    const metadata = await this.prisma.metadata.findFirst({
      where: {key: `face_tags_${mediaHandle}`},
    })

    let tags: FaceTag[] = []

    if (metadata) {
      const data = JSON.parse(metadata.value)
      tags = data.tags || []
    }

    // Remove existing tag for this face (if any)
    tags = tags.filter(t => t.faceId !== tag.faceId)

    // Add new tag
    tags.push(tag)

    const data = {
      tags,
      updatedAt: new Date().toISOString(),
    }

    if (metadata) {
      await this.prisma.metadata.update({
        where: {id: metadata.id},
        data: {value: JSON.stringify(data)},
      })
    } else {
      await this.prisma.metadata.create({
        data: {
          key: `face_tags_${mediaHandle}`,
          value: JSON.stringify(data),
        },
      })
    }
  }
}
