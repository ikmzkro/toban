import {
  Box,
  Flex,
  Float,
  Grid,
  HStack,
  Input,
  List,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "@remix-run/react";
import {
  useActiveWalletIdentity,
  useAddressesByNames,
  useNamesByAddresses,
} from "hooks/useENS";
import {
  useBalanceOfFractionToken,
  useFractionToken,
  useTransferFractionToken,
} from "hooks/useFractionToken";
import { useTreeInfo } from "hooks/useHats";
import { type NameData, TextRecords } from "namestone-sdk";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { ipfs2https } from "utils/ipfs";
import { abbreviateAddress } from "utils/wallet";
import type { Address } from "viem";
import { BasicButton } from "~/components/BasicButton";
import { PageHeader } from "~/components/PageHeader";
import { CommonInput } from "~/components/common/CommonInput";
import { RoleIcon } from "~/components/icon/RoleIcon";
import { UserIcon } from "~/components/icon/UserIcon";
import { Field } from "~/components/ui/field";

const AssistCreditSend: FC = () => {
  const navigate = useNavigate();

  const { treeId, hatId, address } = useParams();
  const me = useActiveWalletIdentity();
  const balanceOfToken = useBalanceOfFractionToken(
    me.identity?.address as Address,
    address as Address,
    BigInt(hatId!),
  );

  // 送信先取得
  const tree = useTreeInfo(Number(treeId));
  const [searchText, setSearchText] = useState<string>("");

  const members = useMemo(() => {
    if (!tree || !tree.hats) return [];
    return tree.hats
      .filter((h) => h.levelAtLocalTree && h.levelAtLocalTree >= 0)
      .flatMap((h) => h.wearers)
      .filter((w) => w)
      .map((w) => w!.id);
  }, [tree]);

  const { names: defaultNames } = useNamesByAddresses(members);
  const { names, fetchNames } = useNamesByAddresses();
  const { addresses, fetchAddresses } = useAddressesByNames();

  const isSearchAddress = useMemo(() => {
    return searchText.startsWith("0x") && searchText.length === 42;
  }, [searchText]);

  useEffect(() => {
    if (isSearchAddress) {
      fetchNames([searchText]);
    } else {
      fetchAddresses([searchText]);
    }
  }, [searchText, isSearchAddress]);

  const users = useMemo(() => {
    return !searchText ? defaultNames : isSearchAddress ? names : addresses;
  }, [defaultNames, names, addresses, isSearchAddress]);

  // 送信先選択後
  const [receiver, setReceiver] = useState<NameData>();
  const [amount, setAmount] = useState<number>(0);

  const { transferFractionToken, isLoading } = useTransferFractionToken(
    BigInt(hatId!),
    address as Address,
  );
  const send = useCallback(async () => {
    if (!receiver || !hatId || !me || isLoading) return;
    try {
      const res = await transferFractionToken(
        receiver.address as Address,
        BigInt(amount),
      );
      res && navigate(`/${treeId}/${hatId}/${address}`);
    } catch (error) {
      console.error(error);
    }
  }, [transferFractionToken, receiver, amount]);

  return (
    <Grid
      gridTemplateRows={!receiver ? "auto auto auto 1fr" : "auto auto 1fr auto"}
      minH="calc(100vh - 72px)"
    >
      <PageHeader
        title={
          receiver
            ? `${receiver.name || `${abbreviateAddress(receiver.address)}に送信`}`
            : "アシストクレジット送信"
        }
        backLink={
          receiver &&
          (() => {
            setReceiver(undefined);
            setAmount(0);
          })
        }
      />

      <HStack my={2}>
        <RoleIcon size="50px" />
        <Text>掃除当番（残高: {balanceOfToken?.toLocaleString()}）</Text>
      </HStack>

      {!receiver ? (
        <>
          <Field label="ユーザー名 or ウォレットアドレスで検索">
            <CommonInput
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder="ユーザー名 or ウォレットアドレス"
            />
          </Field>

          <List.Root listStyle="none" my={10} gap={3}>
            {users?.flat().map((user, index) => (
              <List.Item key={index} onClick={() => setReceiver(user)}>
                <HStack>
                  <UserIcon
                    userImageUrl={ipfs2https(user.text_records?.avatar)}
                    size={10}
                  />
                  <Text lineBreak="anywhere">
                    {user.name
                      ? `${user.name} (${user.address.slice(0, 6)}...${user.address.slice(-4)})`
                      : user.address}
                  </Text>
                </HStack>
              </List.Item>
            ))}
          </List.Root>
        </>
      ) : (
        <>
          <Field label="送信量" alignItems="center" justifyContent="center">
            <Input
              p={2}
              pb={4}
              fontSize="60px"
              size="2xl"
              border="none"
              borderBottom="2px solid"
              borderRadius="0"
              w="auto"
              type="number"
              textAlign="center"
              min={0}
              max={9999}
              style={{
                WebkitAppearance: "none",
              }}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Field>

          <Flex width="100%" flexDirection="column" alignItems="center">
            <HStack columnGap={3} mb={4}>
              <Box textAlign="center">
                <UserIcon
                  size={10}
                  userImageUrl={ipfs2https(me.identity?.text_records?.avatar)}
                />
                <Text fontSize="xs">{me.identity?.name}</Text>
              </Box>
              <VStack textAlign="center">
                <Text>{amount}</Text>
                <FaArrowRight size="20px" />
              </VStack>
              <Box>
                <UserIcon
                  size={10}
                  userImageUrl={ipfs2https(receiver.text_records?.avatar)}
                />
                <Text fontSize="xs">
                  {receiver.name || abbreviateAddress(receiver.address)}
                </Text>
              </Box>
            </HStack>
            <BasicButton loading={isLoading} onClick={send} mb={5}>
              送信
            </BasicButton>
          </Flex>
        </>
      )}
    </Grid>
  );
};

export default AssistCreditSend;
