import { Constants } from "../constants";
import moment from "moment";
import { EmbedBuilder, Client } from "discord.js";
import { AssetEvent } from "../interfaces/OpenSeaEvent";
import osEventFetcher from "../osEventFetcher";

export const getSells = async (client: Client) => {
    let lastSellDate: number = moment.utc(moment()).unix();
    setInterval(async () => {
        try {
            const data = await osEventFetcher(
                "successful",
                lastSellDate,
                Constants.PRIDEPUNK_CONTRACT
            );

            if (data.asset_events && data.asset_events.length > 0) {
                const sortedEvents = data.asset_events.sort(
                    (x, y) =>
                        moment(x.created_date).unix() -
                        moment(y.created_date).unix()
                );

                sortedEvents.forEach(async (sell: AssetEvent) => {
                    const newSale = {
                        id: sell.asset.token_id,
                        timestamp: sell.transaction.timestamp,
                        price: sell.total_price,
                        pfp: sell.asset.image_url
                    };
                    console.log("Publishing sale: " + newSale.timestamp);

                    const sellDateUnix = moment(newSale.timestamp).unix();
                    if (sellDateUnix <= lastSellDate) {
                        return;
                    }
                    lastSellDate = sellDateUnix;

                    const usdSellPrice =
                        sell.payment_token.usd_price *
                        (sell.total_price / Constants.dwApiEthConvValue);

                    const openseaSellEmbed = new EmbedBuilder()
                        .setImage(newSale.pfp)
                        .setTitle(`⛵ Pride Punk#${newSale.id} sold!`)
                        .setColor("Green")
                        .setURL(
                            `https://opensea.io/assets/${Constants.PRIDEPUNK_CONTRACT}/${newSale.id}`
                        )
                        .setFields({
                            name: `🔹 ${(
                                sell.total_price / Constants.dwApiEthConvValue
                            ).toFixed(4)}Ξ (${usdSellPrice.toFixed(2)}$)`,
                            value: "\u200b"
                        })
                        .setTimestamp();

                    const channel = client.channels.cache.get(
                        Constants.SALE_CHANNEL_ID
                    );
                    if (channel?.isTextBased()) {
                        channel.send({ embeds: [openseaSellEmbed] });
                    }
                });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.stack);
            } else {
                console.log(error);
            }
        }
    }, 10000);
};
