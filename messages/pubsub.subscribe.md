# summary

Subscribes to one or more topics.

# description

Connects to a pub / sub endpoint and logs the message to the console.

# flags.count.summary

The number of messages to watch for.

# flags.count.description

The number of messages to wait for before exiting. Defaults to 100.

# flags.topic.summary

The topic to subscribe to.

# flags.topic.description

The path to the topic to subscribe too. Typically starts with either "/data/" or "/event/"

# examples

- <%= config.bin %> <%= command.id %> --target-org myTargetOrg --topic "/data/CaseChangeEvent" --topic "/event/My_Event**e" --topic "/data/My_Object**ChangeEvent"
