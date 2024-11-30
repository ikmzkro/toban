import { useCallback, useState } from "react";
import { Address, decodeEventLog, encodeFunctionData } from "viem";
import { useSmartAccountClient } from "./useSmartWallet";
import { BIGBANG_ADDRESS } from "./useContracts";
import { BIGBANG_ABI } from "abi/bigbang";
import { publicClient } from "./useViem";
import { hatIdToTreeId } from "@hatsprotocol/sdk-v1-core";

export const useBigBang = () => {
	const smartAccountClient = useSmartAccountClient();

	const [isLoading, setIsLoading] = useState(false);

	const bigbang = useCallback(
		async (params: {
			owner: Address;
			topHatDetails: string;
			topHatImageURI: string;
			hatterHatDetails: string;
			hatterHatImageURI: string;
			trustedForwarder: Address;
		}) => {
			if (!smartAccountClient) return;

			setIsLoading(true);

			try {
				const txHash = await smartAccountClient.sendTransaction({
					calls: [
						{
							to: BIGBANG_ADDRESS,
							data: encodeFunctionData({
								abi: BIGBANG_ABI,
								functionName: "bigbang",
								args: [
									params.owner,
									params.topHatDetails,
									params.topHatImageURI,
									params.hatterHatDetails,
									params.hatterHatImageURI,
									params.trustedForwarder,
								],
							}),
						},
					],
				});

				const receipt = await publicClient.waitForTransactionReceipt({
					hash: txHash,
				});

				const log = receipt.logs.find((log) => {
					try {
						const decodedLog = decodeEventLog({
							abi: BIGBANG_ABI,
							data: log.data,
							topics: log.topics,
						});
						return decodedLog.eventName === "Executed";
					} catch (error) {}
				})!;

				if (log) {
					const decodedLog = decodeEventLog({
						abi: BIGBANG_ABI,
						data: log.data,
						topics: log.topics,
					});
					console.log(decodedLog);
					console.log(
						"Tree Link:",
						`https://app.hatsprotocol.xyz/trees/${String(
							publicClient.chain?.id
						)}/${hatIdToTreeId(BigInt(decodedLog.args.topHatId))}`
					);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[smartAccountClient]
	);

	return { bigbang, isLoading };
};
