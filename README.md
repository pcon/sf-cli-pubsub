# @pcon/pubsub

[![NPM](https://img.shields.io/npm/v/@pcon/sf-cli-pubsub.svg?label=sf-cli-pubsub)](https://www.npmjs.com/package/@pcon/sf-cli-pubsub) [![Downloads/week](https://img.shields.io/npm/dw/@pcon/sf-cli-pubsub.svg)](https://npmjs.org/package/@pcon/sf-cli-pubsub)

## Setup

### Install Latest

```
sf plugins install @pcon/sf-cli-pubsub
```

You will be prompted to confirm that you want to install an unsigned plugin. Choose "yes"

```
This plugin is not digitally signed and its authenticity cannot be verified. Continue installation y/n?: y
```

To allowlist this plugin, [add an entry for it in $HOME/.config/sfdx/unsignedPluginAllowList.json](https://developer.salesforce.com/blogs/2017/10/salesforce-dx-cli-plugin-update.html).

### Install Older Version

```bash
sf plugins install @pcon/sf-cli-pubsub@x.y.z
```

## Issues

Please report any issues at https://github.com/pcon/sf-cli-pubsub/issues

## Commands

<!-- commands -->

- [`sf pubsub subscribe`](#sf-pubsub-subscribe)

## `sf pubsub subscribe`

Subscribes to one or more topics.

```
USAGE
  $ sf pubsub subscribe -o <value> --topic <value>... [--json] [--flags-dir <value>] [-c <value>] [--api-version
    <value>]

FLAGS
  -c, --count=<value>        [default: 100] The number of messages to watch for.
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command
      --topic=<value>...     (required) The topic to subscribe to.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Subscribes to one or more topics.

  Connects to a pub / sub endpoint and logs the message to the console.

EXAMPLES
  $ sf pubsub subscribe --target-org myTargetOrg --topic "/data/CaseChangeEvent" --topic "/event/My_Event**e" --topic "/data/My_Object**ChangeEvent"
```

_See code: [src/commands/pubsub/subscribe.ts](https://github.com/pcon/sf-cli-pubsub/blob/1.2.1/src/commands/pubsub/subscribe.ts)_

<!-- commandsstop -->
