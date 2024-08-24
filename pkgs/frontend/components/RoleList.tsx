import {AddIcon} from "@chakra-ui/icons";
import {Box, Grid, IconButton, Text} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

interface RoleListProps {
  hatId: string;
  roles: {name: string; icon: JSX.Element | string; href: string}[];
}

const RoleList: React.FC<RoleListProps> = ({hatId, roles}: any) => {
  return (
    <Box mt={3}>
      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
        {roles.map((role: any) => (
          <Link key={role.name} href={role.href}>
            <Box textAlign="center">
              <Box as="span" fontSize="2xl" mb={2}>
                <Image
                  style={{borderRadius: "5px"}}
                  src={role.icon}
                  width={100}
                  height={100}
                  alt="role"
                />
              </Box>
              <Text>{role.name}</Text>
            </Box>
          </Link>
        ))}
        <Link href={`/${hatId}/createrole`}>
          <IconButton
            width={90}
            height={90}
            aria-label="Roleを追加"
            icon={<AddIcon />}
          />
        </Link>
      </Grid>
    </Box>
  );
};

export default RoleList;
