import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';

import PubSubApiClient from 'salesforce-pubsub-api-client';

export type SubscriptionInfo = {
  isManaged?: boolean;
  topicName?: string;
  subscriptionId?: string;
  subscriptionName?: string;
  requestedEventCount?: number;
  receivedEventCount?: number;
  lastReplayId?: number;
  isInfiniteEventRequest?: boolean;
};

export type ConnectionConfig = {
  authType: string;
  accessToken: string;
  instanceUrl: string;
  organizationId: string;
};

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@pcon/sf-cli-pubsub', 'pubsub.subscribe');

export default class PubsubSubscribe extends SfCommand<undefined> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    count: Flags.integer({
      summary: messages.getMessage('flags.count.summary'),
      char: 'c',
      min: 1,
      max: 100,
      default: 100,
    }),
    topic: Flags.string({
      summary: messages.getMessage('flags.topic.summary'),
      required: true,
      multiple: true,
    }),
    'api-version': Flags.orgApiVersion(),
  };

  public static getClientConfig(connection: Connection, orgId: string): ConnectionConfig {
    return {
      authType: 'user-supplied',
      accessToken: connection.accessToken as string,
      instanceUrl: connection.instanceUrl,
      organizationId: orgId,
    };
  }

  public static getClient(clientConfig: ConnectionConfig): PubSubApiClient {
    return new PubSubApiClient(clientConfig);
  }

  public static getCallbackMessage(subscription: SubscriptionInfo, callbackType: string, data: object): string {
    switch (callbackType) {
      case 'event':
        return JSON.stringify(
          data,
          (key, value) =>
            /* Convert BigInt values into strings and keep other types unchanged */
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            typeof value === 'bigint' ? value.toString() : value,
          2
        );
      case 'lastEvent':
        // Last event received
        return `${subscription.topicName} - Reached last of ${subscription.requestedEventCount} requested event on channel. Closing connection.`;
      case 'end':
        // Client closed the connection
        return 'Client shut down gracefully.';
    }

    return `[ERROR] Unknown callback type - ${callbackType}`;
  }

  public subscribeCallback(subscription: SubscriptionInfo, callbackType: string, data: object): void {
    this.log(PubsubSubscribe.getCallbackMessage(subscription, callbackType, data));
  }

  public async run(): Promise<undefined> {
    const { flags } = await this.parse(PubsubSubscribe);

    const topics = flags.topic;
    const count = flags.count;
    const org = flags['target-org'];

    const clientConfig: ConnectionConfig = PubsubSubscribe.getClientConfig(
      org.getConnection(flags['api-version']),
      org.getOrgId()
    );

    const client = PubsubSubscribe.getClient(clientConfig);
    await client.connect();

    const subscribeCallbackBound = this.subscribeCallback.bind(this);

    topics.forEach((topic) => {
      client.subscribe(`${topic}`, subscribeCallbackBound, count);
    });
  }
}
