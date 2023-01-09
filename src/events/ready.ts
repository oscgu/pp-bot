import {
    ActivityType,
    Client,
    PresenceUpdateStatus
} from "discord.js";
import { getSells } from "../alerts/sale";
import { getOsFloor } from "../utils/getOsFloor";

export default {
    name: "ready",
    once: true,
    async execute(client: Client) {
        console.log("Bot is ready");

        client.user?.setStatus(PresenceUpdateStatus.Idle);
        client.user?.setAvatar(
            "https://ipfs.io/ipfs/bafkreid7a54gogxdq4nifyslwvehyd5car4cnapsp2yghhs6ay36o2vc44"
        );

        setInterval(async () => {
            try {
                const osFloor = await getOsFloor();
                client.user?.setActivity(`Floor: ${osFloor}`, {
                    type: ActivityType.Watching
                });
            } catch (err) {
                if (err instanceof Error) {
                    console.log(err.stack);
                } else {
                    console.log(err);
                }
            }
        }, 20000);

        try {
            await getSells(client);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.stack);
            } else {
                console.log(error);
            }
        }
    }
};
