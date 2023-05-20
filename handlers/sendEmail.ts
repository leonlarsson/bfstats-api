import { BaseStatsObject, Environment } from "../types";

export default async (env: Environment) => {
    const statsObject: BaseStatsObject = await env.DATA_KV.get("STATS", { type: "json" });

    return fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: "Battlefield Stats Worker <bfstats@leonlarsson.com>",
            to: "leonlarsson8@gmail.com",
            subject: "Battlefield Stats Update",
            html: `<h2>Base:</h2>
            <ul>
            <li>Total Guilds: <b>${statsObject.totalGuilds.toLocaleString("en-US")}</b></li>
            <li>Total Channels: <b>${statsObject.totalChannels.toLocaleString("en-US")}</b></li>
            <li>Total Members: <b>${statsObject.totalMembers.toLocaleString("en-US")}</b></li>
            </ul>
            <h2>Stats Sent:</h2>
            Total: <b>${statsObject.totalStatsSent.total.toLocaleString("en-US")}</b>
            <h3>Games</h3>
            <ul>
            ${Object.entries(statsObject.totalStatsSent.games).map(x => `<li>${x[0]}: <b>${x[1].toLocaleString("en-US")}</b></li>`).join("\n")}
            </ul>
            <h3>Languages</h3>
            <ul>
            ${Object.entries(statsObject.totalStatsSent.languages).map(x => `<li>${x[0]}: <b>${x[1].toLocaleString("en-US")}</b></li>`).join("\n")}
            </ul>`
        })
    });
};
