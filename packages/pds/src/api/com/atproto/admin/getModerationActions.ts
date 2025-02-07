import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'

export default function (server: Server, ctx: AppContext) {
  server.com.atproto.admin.getModerationActions({
    auth: ctx.adminVerifier,
    handler: async ({ params }) => {
      const { db, services } = ctx
      const { subject, limit = 50, before } = params
      const moderationService = services.moderation(db)
      const results = await moderationService.getActions({
        subject,
        limit,
        before,
      })
      return {
        encoding: 'application/json',
        body: {
          cursor: results.at(-1)?.id.toString() ?? undefined,
          actions: await moderationService.views.action(results),
        },
      }
    },
  })
}
