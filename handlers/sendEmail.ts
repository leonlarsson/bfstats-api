import { BaseStatsObject, Environment } from "../types";

export default async (env: Environment) => {

    const statsObject: BaseStatsObject = await env.DATA_KV.get("STATS", { type: "json" });

    const emailBody = `--CURRENT BFSTATS API DATA--
Base:
    Total Guilds: ${statsObject.totalGuilds.toLocaleString("en-US")}
    Total Channels: ${statsObject.totalChannels.toLocaleString("en-US")}
    Total Members: ${statsObject.totalMembers.toLocaleString("en-US")}
Stats Sent:
    Total: ${statsObject.totalStatsSent.total}
    Games:
       ${Object.entries(statsObject.totalStatsSent.games).map(x => (`${x[0]}: ${x[1].toLocaleString("en-US")}`)).join("\n       ")}
    Languages:
       ${Object.entries(statsObject.totalStatsSent.languages).map(x => (`${x[0]}: ${x[1].toLocaleString("en-US")}`)).join("\n       ")}`;

    return fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            personalizations: [
                {
                    to: [{ email: env.EMAIL, name: "Leon" }]
                    // figure out DKIM at some point
                }
            ],
            from: {
                email: "bfstats@leonlarsson.com",
                name: "Battlefield Stats Worker"
            },
            subject: "Battlefield Stats Update",
            content: [
                {
                    type: "text/plain",
                    value: emailBody
                }
            ]
        })
    });
};