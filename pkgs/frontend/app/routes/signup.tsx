import { Box, Flex, Grid, Input, Text } from "@chakra-ui/react";
import { useAddressesByNames, useSetName } from "hooks/useENS";
import { useUploadImageFileToIpfs } from "hooks/useIpfs";
import { useActiveWallet } from "hooks/useWallet";
import type { TextRecords } from "namestone-sdk";
import { type FC, useMemo, useState } from "react";
import { BasicButton } from "~/components/BasicButton";
import { CommonInput } from "~/components/common/CommonInput";
import { UserIcon } from "~/components/icon/UserIcon";

const Login: FC = () => {
  const [userName, setUserName] = useState("");

  const {
    uploadImageFileToIpfs,
    imageFile,
    setImageFile,
    isLoading: isIpfsLoading,
  } = useUploadImageFileToIpfs();

  const { wallet } = useActiveWallet();

  const { setName, isLoading: isSetNameLoading } = useSetName();

  const names = useMemo(() => {
    return userName ? [userName] : [];
  }, [userName]);
  const { addresses } = useAddressesByNames(names, true);

  const availableName = useMemo(() => {
    if (!userName) return false;

    return addresses?.[0]?.length === 0;
  }, [userName, addresses]);

  const handleSubmit = async () => {
    if (!wallet || !availableName) return;

    const params: {
      name: string;
      address: string;
      text_records: TextRecords;
    } = {
      name: userName,
      address: wallet.account?.address,
      text_records: {},
    };

    if (imageFile) {
      const res = await uploadImageFileToIpfs();
      if (res) params.text_records.avatar = res.ipfsUri;
    }

    await setName(params);

    window.location.href = "/workspace";
  };

  return (
    <Grid gridTemplateRows="1fr auto" h="calc(100vh - 72px)">
      <Flex justifyContent="center" alignItems="center" flexWrap="wrap">
        <Box w="100%">
          <Flex
            flexDirection="column"
            cursor="pointer"
            justifyContent="center"
            alignItems="center"
            mb={8}
            as="label"
          >
            <Input
              type="file"
              accept="image/*"
              display="none"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file?.type.startsWith("image/")) {
                  setImageFile(file);
                } else {
                  alert("画像ファイルを選択してください");
                }
              }}
            />
            <UserIcon
              userImageUrl={
                imageFile ? URL.createObjectURL(imageFile) : undefined
              }
              size="180px"
            />
            {!imageFile && (
              <Text fontSize="sm" mt={2}>
                画像を選択
              </Text>
            )}
          </Flex>
          <Box width="100%">
            <CommonInput
              value={userName}
              placeholder="ユーザー名"
              onChange={(e) => setUserName(e.target.value)}
            />
            <Text textAlign="right" fontSize="xs" mt={1}>
              {availableName
                ? "この名前は利用可能です"
                : "この名前は利用できません"}
            </Text>
          </Box>
        </Box>
      </Flex>
      <Box mb={5}>
        <BasicButton
          onClick={handleSubmit}
          loading={isIpfsLoading || isSetNameLoading}
          disabled={!availableName}
        >
          保存
        </BasicButton>
      </Box>
    </Grid>
  );
};

export default Login;
