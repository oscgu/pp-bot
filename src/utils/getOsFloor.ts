import { Constants } from "../constants";
import { MarketStats } from "../interfaces/MarketStats";
import { sfetch } from "../sfetch";

export const getOsFloor = async (): Promise<number> => {
    try {
        const response = await sfetch<MarketStats>(
            `${Constants.OS_API}/collection/${Constants.OS_SLUG}/stats`
        );
        return response!.stats.floor_price;
    } catch (error: unknown) {
        return Promise.reject(error);
    }
};
