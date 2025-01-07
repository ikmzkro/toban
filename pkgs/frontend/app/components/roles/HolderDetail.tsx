import { FC } from "react";
import { HatsDetailSchama } from "types/hats";
import { RoleIcon } from "../icon/RoleIcon";
import { Box, Heading, HStack, Icon, List, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { UserIcon } from "../icon/UserIcon";
import { ipfs2https } from "utils/ipfs";
import { FaChevronLeft, FaLink } from "react-icons/fa6";
import { abbreviateAddress } from "utils/wallet";

interface HolderDetailProps {
  detail?: HatsDetailSchama;
  imageUri?: string;
  treeId?: string;
  hatId?: string;
  wearerId?: string;
  wearerName?: string;
  wearerIcon?: string;
}

export const RoleName: FC<HolderDetailProps> = ({ detail, treeId }) => (
  <Link to={`/${treeId}`}>
    <HStack paddingBottom={4} alignItems="baseline">
      <Icon fontSize={18}>
        <FaChevronLeft />
      </Icon>
      {detail?.data.name ? (
        <Heading size="2xl">{detail.data.name}</Heading>
      ) : (
        <Heading size="2xl" fontStyle="italic" color="gray.400">
          No name
        </Heading>
      )}
    </HStack>
  </Link>
);

export const RoleNameWithWearer: FC<HolderDetailProps> = ({
  detail,
  treeId,
  hatId,
  wearerId,
  wearerName,
  wearerIcon,
}) => (
  <Link to={`/${treeId}/${hatId}`}>
    <HStack paddingBottom={4} alignItems="baseline">
      <Icon fontSize={18}>
        <FaChevronLeft />
      </Icon>
      {detail?.data.name ? (
        <>
          <Heading size="2xl">{detail.data.name}</Heading>
          <Icon fontSize={18}>
            <FaLink />
          </Icon>
          <UserIcon userImageUrl={ipfs2https(wearerIcon)} size={8} />
          <Heading size="2xl">
            {wearerName ? wearerName : abbreviateAddress(wearerId || "0x")}
          </Heading>
        </>
      ) : (
        <Heading size="2xl" fontStyle="italic" color="gray.400">
          No name
        </Heading>
      )}
    </HStack>
  </Link>
);

export const HolderDetail: FC<HolderDetailProps> = ({ detail, imageUri }) => (
  <Box>
    <Box float="left" paddingRight={4}>
      <RoleIcon size={100} roleImageUrl={imageUri} />
    </Box>
    <Box>
      <Box paddingY={2}>
        <Heading>Description</Heading>
        {detail?.data.description ? (
          <Text>{detail.data.description}</Text>
        ) : (
          <Text fontStyle="italic" color="gray.400">
            No description
          </Text>
        )}
      </Box>
      <Box paddingY={2} clear="both">
        <Heading>Responsibilities</Heading>
        {(detail?.data.responsabilities?.length ?? 0 > 0) ? (
          <List.Root>
            {detail?.data.responsabilities?.map((r) => (
              <List.Item key={r.label}>{r.label}</List.Item>
            ))}
          </List.Root>
        ) : (
          <Text fontStyle="italic" color="gray.400">
            No responsibilities
          </Text>
        )}
      </Box>
      <Box paddingY={2} clear="both">
        <Heading>Authorities</Heading>
        {(detail?.data.authorities?.length ?? 0 > 0) ? (
          <List.Root>
            {detail?.data.authorities?.map((a) => (
              <List.Item key={a.label}>{a.label}</List.Item>
            ))}
          </List.Root>
        ) : (
          <Text fontStyle="italic" color="gray.400">
            No authorities
          </Text>
        )}
      </Box>
    </Box>
  </Box>
);

export default HolderDetail;
