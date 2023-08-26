# RoboJames
I captured James in a robot now he will monitor our emails forever muahaha

Discord bot for reading RU Makers email and sending updates in the channel

# Setup Instructions
Create config.json in project root directory
Input the following information:
```
{
    "clientId": "[bot id]",
    "guildIds": [
        "[server id]",
    ],
    "token": "[bot token]",
    "emailPassword": "[app password]"
}
```

Set up app password
- go to google account
- select Security
- Under "Signing in to Google," select 2-Step Verification.
- At the bottom of the page, select App passwords.
- Enter "imap" as the name
- select generate
- copy and paste the password into config.json
