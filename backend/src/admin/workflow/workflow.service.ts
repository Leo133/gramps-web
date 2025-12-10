import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a change proposal
   */
  async submitProposal(params: {
    submitterId: string
    entityType: string
    entityId?: string
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    proposedChanges: any
    currentState?: any
  }) {
    const {submitterId, entityType, entityId, operation, proposedChanges, currentState} = params

    // Validate that submitter has contributor or lower role
    const submitter = await this.prisma.user.findUnique({
      where: {id: submitterId},
    })

    if (!submitter) {
      throw new Error('Submitter not found')
    }

    // Create the proposal
    const proposal = await this.prisma.changeProposal.create({
      data: {
        submitterId,
        entityType,
        entityId,
        operation,
        proposedChanges: JSON.stringify(proposedChanges),
        currentState: currentState ? JSON.stringify(currentState) : null,
        status: 'pending',
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    })

    return {
      ...proposal,
      proposedChanges: JSON.parse(proposal.proposedChanges),
      currentState: proposal.currentState ? JSON.parse(proposal.currentState) : null,
    }
  }

  /**
   * Get all proposals with optional filters
   */
  async findAll(params?: {
    status?: 'pending' | 'approved' | 'rejected'
    submitterId?: string
    reviewerId?: string
    entityType?: string
    page?: number
    perPage?: number
  }) {
    const {
      status,
      submitterId,
      reviewerId,
      entityType,
      page = 1,
      perPage = 50,
    } = params || {}

    const where: any = {}
    if (status) where.status = status
    if (submitterId) where.submitterId = submitterId
    if (reviewerId) where.reviewerId = reviewerId
    if (entityType) where.entityType = entityType

    const [total, proposals] = await Promise.all([
      this.prisma.changeProposal.count({where}),
      this.prisma.changeProposal.findMany({
        where,
        include: {
          submitter: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: {submittedAt: 'desc'},
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return {
      data: proposals.map(p => ({
        ...p,
        proposedChanges: JSON.parse(p.proposedChanges),
        currentState: p.currentState ? JSON.parse(p.currentState) : null,
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /**
   * Get a specific proposal
   */
  async findOne(id: string) {
    const proposal = await this.prisma.changeProposal.findUnique({
      where: {id},
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    })

    if (!proposal) {
      throw new Error('Proposal not found')
    }

    return {
      ...proposal,
      proposedChanges: JSON.parse(proposal.proposedChanges),
      currentState: proposal.currentState ? JSON.parse(proposal.currentState) : null,
    }
  }

  /**
   * Approve a proposal and apply changes
   */
  async approve(params: {
    proposalId: string
    reviewerId: string
    comment?: string
  }) {
    const {proposalId, reviewerId, comment} = params

    // Validate reviewer has editor+ role
    const reviewer = await this.prisma.user.findUnique({
      where: {id: reviewerId},
    })

    if (!reviewer) {
      throw new Error('Reviewer not found')
    }

    const roleLevel = this.getRoleLevel(reviewer.role)
    if (roleLevel < 3) {
      throw new Error('Only editors and owners can approve proposals')
    }

    // Get the proposal
    const proposal = await this.findOne(proposalId)

    if (proposal.status !== 'pending') {
      throw new Error('Proposal is not pending')
    }

    // Apply the changes based on operation
    const applied = await this.applyProposal(proposal)

    // Update proposal status
    const updated = await this.prisma.changeProposal.update({
      where: {id: proposalId},
      data: {
        status: 'approved',
        reviewerId,
        comment,
        reviewedAt: new Date(),
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    })

    // Log the approval
    await this.prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'APPROVE_PROPOSAL',
        entityType: 'ChangeProposal',
        entityId: proposalId,
        changes: JSON.stringify({
          proposalId,
          entityType: proposal.entityType,
          entityId: proposal.entityId,
          operation: proposal.operation,
          appliedChanges: applied,
        }),
      },
    })

    return {
      ...updated,
      proposedChanges: JSON.parse(updated.proposedChanges),
      currentState: updated.currentState ? JSON.parse(updated.currentState) : null,
      appliedChanges: applied,
    }
  }

  /**
   * Reject a proposal
   */
  async reject(params: {
    proposalId: string
    reviewerId: string
    comment: string
  }) {
    const {proposalId, reviewerId, comment} = params

    // Validate reviewer has editor+ role
    const reviewer = await this.prisma.user.findUnique({
      where: {id: reviewerId},
    })

    if (!reviewer) {
      throw new Error('Reviewer not found')
    }

    const roleLevel = this.getRoleLevel(reviewer.role)
    if (roleLevel < 3) {
      throw new Error('Only editors and owners can reject proposals')
    }

    // Get the proposal
    const proposal = await this.findOne(proposalId)

    if (proposal.status !== 'pending') {
      throw new Error('Proposal is not pending')
    }

    // Update proposal status
    const updated = await this.prisma.changeProposal.update({
      where: {id: proposalId},
      data: {
        status: 'rejected',
        reviewerId,
        comment,
        reviewedAt: new Date(),
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    })

    // Log the rejection
    await this.prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'REJECT_PROPOSAL',
        entityType: 'ChangeProposal',
        entityId: proposalId,
        changes: JSON.stringify({
          proposalId,
          entityType: proposal.entityType,
          entityId: proposal.entityId,
          operation: proposal.operation,
          reason: comment,
        }),
      },
    })

    return {
      ...updated,
      proposedChanges: JSON.parse(updated.proposedChanges),
      currentState: updated.currentState ? JSON.parse(updated.currentState) : null,
    }
  }

  /**
   * Get proposal statistics
   */
  async getStatistics() {
    const [
      totalProposals,
      pendingCount,
      approvedCount,
      rejectedCount,
      byEntityType,
      byOperation,
    ] = await Promise.all([
      this.prisma.changeProposal.count(),
      this.prisma.changeProposal.count({where: {status: 'pending'}}),
      this.prisma.changeProposal.count({where: {status: 'approved'}}),
      this.prisma.changeProposal.count({where: {status: 'rejected'}}),
      this.prisma.changeProposal.groupBy({
        by: ['entityType'],
        _count: true,
      }),
      this.prisma.changeProposal.groupBy({
        by: ['operation'],
        _count: true,
      }),
    ])

    return {
      total: totalProposals,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      approvalRate: totalProposals > 0 ? (approvedCount / totalProposals) * 100 : 0,
      byEntityType: byEntityType.map(item => ({
        entityType: item.entityType,
        count: item._count,
      })),
      byOperation: byOperation.map(item => ({
        operation: item.operation,
        count: item._count,
      })),
    }
  }

  /**
   * Helper: Apply proposal changes to actual entity
   */
  private async applyProposal(proposal: any) {
    const {entityType, entityId, operation, proposedChanges} = proposal

    switch (operation) {
      case 'CREATE':
        return this.applyCreate(entityType, proposedChanges)
      case 'UPDATE':
        return this.applyUpdate(entityType, entityId, proposedChanges)
      case 'DELETE':
        return this.applyDelete(entityType, entityId)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  /**
   * Helper: Apply CREATE operation
   */
  private async applyCreate(entityType: string, data: any) {
    switch (entityType) {
      case 'Person':
        return this.prisma.person.create({data})
      case 'Family':
        return this.prisma.family.create({data})
      case 'Event':
        return this.prisma.event.create({data})
      case 'Place':
        return this.prisma.place.create({data})
      case 'Media':
        return this.prisma.media.create({data})
      case 'Source':
        return this.prisma.source.create({data})
      case 'Note':
        return this.prisma.note.create({data})
      default:
        throw new Error(`Unsupported entity type: ${entityType}`)
    }
  }

  /**
   * Helper: Apply UPDATE operation
   */
  private async applyUpdate(entityType: string, entityId: string, data: any) {
    switch (entityType) {
      case 'Person':
        return this.prisma.person.update({where: {id: entityId}, data})
      case 'Family':
        return this.prisma.family.update({where: {id: entityId}, data})
      case 'Event':
        return this.prisma.event.update({where: {id: entityId}, data})
      case 'Place':
        return this.prisma.place.update({where: {id: entityId}, data})
      case 'Media':
        return this.prisma.media.update({where: {id: entityId}, data})
      case 'Source':
        return this.prisma.source.update({where: {id: entityId}, data})
      case 'Note':
        return this.prisma.note.update({where: {id: entityId}, data})
      default:
        throw new Error(`Unsupported entity type: ${entityType}`)
    }
  }

  /**
   * Helper: Apply DELETE operation
   */
  private async applyDelete(entityType: string, entityId: string) {
    switch (entityType) {
      case 'Person':
        return this.prisma.person.delete({where: {id: entityId}})
      case 'Family':
        return this.prisma.family.delete({where: {id: entityId}})
      case 'Event':
        return this.prisma.event.delete({where: {id: entityId}})
      case 'Place':
        return this.prisma.place.delete({where: {id: entityId}})
      case 'Media':
        return this.prisma.media.delete({where: {id: entityId}})
      case 'Source':
        return this.prisma.source.delete({where: {id: entityId}})
      case 'Note':
        return this.prisma.note.delete({where: {id: entityId}})
      default:
        throw new Error(`Unsupported entity type: ${entityType}`)
    }
  }

  /**
   * Helper: Get role level
   */
  private getRoleLevel(role: string): number {
    const levels: Record<string, number> = {
      owner: 4,
      editor: 3,
      contributor: 2,
      member: 1,
    }
    return levels[role] || 0
  }
}
