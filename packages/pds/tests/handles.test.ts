import AtpAgent from '@atproto/api'
import { SeedClient } from './seeds/client'
import basicSeed from './seeds/basic'
import * as util from './_util'
import { AppContext } from '../src'

describe('handles', () => {
  let agent: AtpAgent
  let close: util.CloseFn
  let sc: SeedClient
  let ctx: AppContext

  let alice: string
  let bob: string
  const newHandle = 'alice2.test'

  beforeAll(async () => {
    const server = await util.runTestServer({
      dbPostgresSchema: 'handles',
    })
    ctx = server.ctx
    close = server.close
    agent = new AtpAgent({ service: server.url })
    sc = new SeedClient(agent)
    await basicSeed(sc)
    alice = sc.dids.alice
    bob = sc.dids.bob
  })

  afterAll(async () => {
    await close()
  })

  it('resolves handles', async () => {
    const res = await agent.api.com.atproto.handle.resolve({
      handle: 'alice.test',
    })
    expect(res.data.did).toBe(alice)
  })

  it('allows a user to change their handle', async () => {
    await agent.api.com.atproto.handle.update(
      { handle: newHandle },
      { headers: sc.getHeaders(alice), encoding: 'application/json' },
    )
    const attemptOld = agent.api.com.atproto.handle.resolve({
      handle: 'alice.test',
    })
    await expect(attemptOld).rejects.toThrow('Unable to resolve handle')
    const attemptNew = await agent.api.com.atproto.handle.resolve({
      handle: newHandle,
    })
    expect(attemptNew.data.did).toBe(alice)
  })

  it('updates their did document', async () => {
    const data = await ctx.plcClient.getDocumentData(alice)
    expect(data.handle).toBe(newHandle)
  })

  it('allows a user to login with their new handle', async () => {
    const res = await agent.api.com.atproto.session.create({
      identifier: newHandle,
      password: sc.accounts[alice].password,
    })
    sc.accounts[alice].accessJwt = res.data.accessJwt
    sc.accounts[alice].refreshJwt = res.data.refreshJwt
  })

  it('returns the correct handle in views', async () => {
    const profile = await agent.api.app.bsky.actor.getProfile(
      { actor: alice },
      { headers: sc.getHeaders(bob) },
    )
    expect(profile.data.handle).toBe(newHandle)

    const timeline = await agent.api.app.bsky.feed.getTimeline(
      {},
      { headers: sc.getHeaders(bob) },
    )

    const alicePosts = timeline.data.feed.filter(
      (post) => post.post.author.did === alice,
    )
    for (const post of alicePosts) {
      expect(post.post.author.handle).toBe(newHandle)
    }

    const followers = await agent.api.app.bsky.graph.getFollowers(
      { user: bob },
      { headers: sc.getHeaders(bob) },
    )

    const aliceFollows = followers.data.followers.filter((f) => f.did === alice)
    expect(aliceFollows.length).toBe(1)
    expect(aliceFollows[0].handle).toBe(newHandle)
  })

  it('does not allow taking a handle that already exists', async () => {
    const attempt = agent.api.com.atproto.handle.update(
      { handle: 'Bob.test' },
      { headers: sc.getHeaders(alice), encoding: 'application/json' },
    )
    await expect(attempt).rejects.toThrow('Handle already taken: bob.test')
  })

  it('if handle update fails, it does not update their did document', async () => {
    const data = await ctx.plcClient.getDocumentData(alice)
    expect(data.handle).toBe(newHandle)
  })

  it('disallows improperly formatted handles', async () => {
    const tryHandle = async (handle: string) => {
      await agent.api.com.atproto.handle.update(
        { handle },
        { headers: sc.getHeaders(alice), encoding: 'application/json' },
      )
    }
    await expect(tryHandle('did:john')).rejects.toThrow(
      'Cannot register a handle that starts with `did:`',
    )
    await expect(tryHandle('john.bsky.io')).rejects.toThrow(
      'Not a supported handle domain',
    )
    await expect(tryHandle('j.test')).rejects.toThrow('Handle too short')
    await expect(tryHandle('jayromy-johnber123456.test')).rejects.toThrow(
      'Handle too long',
    )
    await expect(tryHandle('jo_hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo!hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo%hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo&hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo*hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo|hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo:hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('jo/hn.test')).rejects.toThrow(
      'Invalid characters in handle',
    )
    await expect(tryHandle('about.test')).rejects.toThrow('Reserved handle')
    await expect(tryHandle('atp.test')).rejects.toThrow('Reserved handle')
  })
})
