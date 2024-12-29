import { useCallback, useEffect, useMemo, useState } from "react";
import { NameData, TextRecords } from "namestone-sdk";
import axios from "axios";
import { useActiveWallet } from "./useWallet";

export const useActiveWalletIdentity = () => {
  const { wallet } = useActiveWallet();

  const address = useMemo(() => {
    return [wallet?.account?.address!];
  }, [wallet]);
  const { names } = useNamesByAddresses(address);

  const identity = useMemo(() => {
    if (!names || names.length === 0) return;
    return names[0][0];
  }, [names]);

  return { identity };
};

export const useNamesByAddresses = (addresses?: string[]) => {
  const [names, setNames] = useState<NameData[][]>([]);

  useEffect(() => {
    if (!addresses || addresses.length == 0) return;
    fetchNames(addresses);
  }, [addresses]);

  const fetchNames = async (addresses: string[]) => {
    try {
      const { data } = await axios.get<NameData[][]>(
        "/api/namestone/resolve-names",
        {
          params: { addresses: addresses.join(",") },
        }
      );
      const unresolvedAddresses = addresses
        .filter((address) => {
          return !data.some(
            (nameData) =>
              nameData[0]?.address.toLowerCase() === address.toLowerCase()
          );
        })
        .map((address) => {
          return [{ address, name: "", domain: "" }];
        });
      setNames([...data, ...unresolvedAddresses]);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  return { names, fetchNames };
};

export const useAddressesByNames = (names?: string[], exactMatch?: boolean) => {
  const [addresses, setAddresses] = useState<NameData[][]>([]);

  const fetchAddresses = useCallback(async (resolveNames: string[]) => {
    try {
      const { data } = await axios.get<NameData[][]>(
        "/api/namestone/resolve-addresses",
        {
          params: { names: resolveNames.join(","), exact_match: exactMatch },
        }
      );
      setAddresses(data);
      return data as NameData[][];
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!names || names.length === 0 || names.includes("")) return;
    fetchAddresses(names);
  }, [names]);

  return { addresses, fetchAddresses };
};

export const useSetName = () => {
  const [isLoading, setIsLoading] = useState(false);

  const setName = useCallback(
    async (params: {
      name: string;
      address?: string;
      text_records?: TextRecords;
    }) => {
      if (!params.address || !params.name) return;
      setIsLoading(true);
      try {
        await axios.post("/api/namestone/set-name", params);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    },
    []
  );

  return { setName, isLoading };
};
