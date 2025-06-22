import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import * as chai from 'chai';
// import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import PubSubApiClient from 'salesforce-pubsub-api-client';
import PubsubSubscribe from '../../../src/commands/pubsub/subscribe.js';
import { SubscriptionInfo } from '../../../src/commands/pubsub/subscribe.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
chai.use(sinonChai);

describe('subscribe', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  // let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    // sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
    sinon.restore();
  });

  it('gets client config', async () => {
    await $$.stubAuths(testOrg);
    const connection = await testOrg.getConnection();
    const clientConfig = PubsubSubscribe.getClientConfig(connection, '12345');
    const expectedConfig = {
      authType: 'user-supplied',
      accessToken: connection.accessToken,
      instanceUrl: connection.instanceUrl,
      organizationId: '12345',
    };

    chai.expect(clientConfig).to.deep.equal(expectedConfig);
  });

  it('gets callback message for an event', async () => {
    const subInfo: SubscriptionInfo = {};
    const message = PubsubSubscribe.getCallbackMessage(subInfo, 'event', { foo: 'bar' });
    chai.expect(message).to.equal('{\n  "foo": "bar"\n}');
  });

  it('gets callback message for the last event', async () => {
    const subInfo: SubscriptionInfo = {
      topicName: '/data/CaseChangeEvent',
      requestedEventCount: 10,
    };
    const message = PubsubSubscribe.getCallbackMessage(subInfo, 'lastEvent', { foo: 'bar' });
    chai
      .expect(message)
      .to.equal('/data/CaseChangeEvent - Reached last of 10 requested event on channel. Closing connection.');
  });

  it('gets callback message for end', async () => {
    const subInfo: SubscriptionInfo = {};
    const message = PubsubSubscribe.getCallbackMessage(subInfo, 'end', { foo: 'bar' });
    chai.expect(message).to.equal('Client shut down gracefully.');
  });

  it('gets callback message for unknown event', async () => {
    const subInfo: SubscriptionInfo = {};
    const message = PubsubSubscribe.getCallbackMessage(subInfo, 'unknownEvent', { foo: 'bar' });
    chai.expect(message).to.equal('[ERROR] Unknown callback type - unknownEvent');
  });

  it('runs subscribe single topic', async () => {
    const PubSubApiClientStub = sinon.createStubInstance(PubSubApiClient);
    sinon.replace(PubsubSubscribe, 'getClient', sinon.fake.returns(PubSubApiClientStub));

    await PubsubSubscribe.run(['-o', testOrg.username, '--topic', '/data/CaseChangeEvent']);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    chai.expect(PubSubApiClientStub.connect).to.have.been.called;

    // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-call
    chai.expect(PubSubApiClientStub.subscribe).to.have.been.calledWith('/data/CaseChangeEvent');
  });

  it('runs subscribe multiple topics', async () => {
    const PubSubApiClientStub = sinon.createStubInstance(PubSubApiClient);
    sinon.replace(PubsubSubscribe, 'getClient', sinon.fake.returns(PubSubApiClientStub));

    await PubsubSubscribe.run([
      '-o',
      testOrg.username,
      '--topic',
      '/data/CaseChangeEvent',
      '--topic',
      '/event/My_Event__e',
    ]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    chai.expect(PubSubApiClientStub.connect).to.have.been.called;

    // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-call
    chai.expect(PubSubApiClientStub.subscribe).to.have.been.calledWith('/data/CaseChangeEvent');

    // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-call
    chai.expect(PubSubApiClientStub.subscribe).to.have.been.calledWith('/event/My_Event__e');
  });
});
