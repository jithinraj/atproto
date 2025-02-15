import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'

export default function (server: Server, ctx: AppContext) {
  server.com.atproto.admin.getModerationReports({
    auth: ctx.adminVerifier,
    handler: async ({ params }) => {
      const { db, services } = ctx
      const { subject, resolved, limit = 50, before } = params
      const moderationService = services.moderation(db)
      const results = await moderationService.getReports({
        subject,
        resolved,
        limit,
        before,
      })
      return {
        encoding: 'application/json',
        body: {
          cursor: results.at(-1)?.id.toString() ?? undefined,
          reports: await moderationService.views.report(results),
        },
      }
    },
  })
}
