import { AtUri } from '@atproto/uri'
import { InvalidRequestError } from '@atproto/xrpc-server'
import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'
import { TAKEDOWN } from '../../../../lexicon/types/com/atproto/admin/moderationAction'

export default function (server: Server, ctx: AppContext) {
  server.com.atproto.admin.reverseModerationAction({
    auth: ctx.adminVerifier,
    handler: async ({ input }) => {
      const { db, services } = ctx
      const moderationService = services.moderation(db)
      const { id, createdBy, reason } = input.body

      const moderationAction = await db.transaction(async (dbTxn) => {
        const moderationTxn = services.moderation(dbTxn)
        const now = new Date()

        const existing = await moderationTxn.getAction(id)
        if (!existing) {
          throw new InvalidRequestError('Moderation action does not exist')
        }
        if (existing.reversedAt !== null) {
          throw new InvalidRequestError(
            'Moderation action has already been reversed',
          )
        }

        const result = await moderationTxn.logReverseAction({
          id,
          createdAt: now,
          createdBy,
          reason,
        })

        if (
          result.action === TAKEDOWN &&
          result.subjectType === 'com.atproto.repo.repoRef' &&
          result.subjectDid
        ) {
          await moderationTxn.reverseTakedownRepo({
            did: result.subjectDid,
          })
        }

        if (
          result.action === TAKEDOWN &&
          result.subjectType === 'com.atproto.repo.recordRef' &&
          result.subjectUri
        ) {
          await moderationTxn.reverseTakedownRecord({
            uri: new AtUri(result.subjectUri),
          })
        }

        return result
      })

      return {
        encoding: 'application/json',
        body: await moderationService.views.action(moderationAction),
      }
    },
  })
}
