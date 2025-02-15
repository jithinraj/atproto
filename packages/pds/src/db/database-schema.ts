import { Kysely } from 'kysely'
import * as userAccount from './tables/user-account'
import * as userState from './tables/user-state'
import * as didHandle from './tables/did-handle'
import * as repoRoot from './tables/repo-root'
import * as refreshToken from './tables/refresh-token'
import * as record from './tables/record'
import * as repoCommitBlock from './tables/repo-commit-block'
import * as repoCommitHistory from './tables/repo-commit-history'
import * as ipldBlock from './tables/ipld-block'
import * as inviteCode from './tables/invite-code'
import * as duplicateRecords from './tables/duplicate-record'
import * as notification from './tables/user-notification'
import * as assertion from './tables/assertion'
import * as profile from './tables/profile'
import * as post from './tables/post'
import * as postHierarchy from './tables/post-hierarchy'
import * as postEntity from './tables/post-entity'
import * as postEmbedImage from './tables/post-embed-image'
import * as postEmbedExternal from './tables/post-embed-external'
import * as vote from './tables/vote'
import * as repost from './tables/repost'
import * as follow from './tables/follow'
import * as blob from './tables/blob'
import * as repoBlob from './tables/repo-blob'
import * as deleteAccountToken from './tables/delete-account-token'
import * as messageQueue from './tables/message-queue'
import * as messageQueueCursor from './tables/message-queue-cursor'
import * as moderation from './tables/moderation'
import * as mute from './tables/mute'
import * as repoSeq from './tables/repo-seq'

export type DatabaseSchemaType = userAccount.PartialDB &
  userState.PartialDB &
  didHandle.PartialDB &
  refreshToken.PartialDB &
  repoRoot.PartialDB &
  record.PartialDB &
  repoCommitBlock.PartialDB &
  repoCommitHistory.PartialDB &
  ipldBlock.PartialDB &
  repoCommitBlock.PartialDB &
  repoCommitHistory.PartialDB &
  inviteCode.PartialDB &
  duplicateRecords.PartialDB &
  notification.PartialDB &
  assertion.PartialDB &
  profile.PartialDB &
  post.PartialDB &
  postHierarchy.PartialDB &
  postEntity.PartialDB &
  postEmbedImage.PartialDB &
  postEmbedExternal.PartialDB &
  vote.PartialDB &
  repost.PartialDB &
  follow.PartialDB &
  blob.PartialDB &
  repoBlob.PartialDB &
  deleteAccountToken.PartialDB &
  messageQueue.PartialDB &
  messageQueueCursor.PartialDB &
  moderation.PartialDB &
  mute.PartialDB &
  repoSeq.PartialDB

export type DatabaseSchema = Kysely<DatabaseSchemaType>

export default DatabaseSchema
