import { Box, Flex, Text, Icon, VStack } from '@chakra-ui/react';
import { FaUserFriends } from 'react-icons/fa';
import { IoMdArrowRoundForward } from 'react-icons/io';

interface ProjectInfoProps {
  members: number;
  splitters: number;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ members, splitters }) => {
  return (
    <VStack align="start" spacing={4}>
      <Text fontSize="2xl" fontWeight="bold">
        Project Information
      </Text>
      <Flex align="center">
        <Icon as={FaUserFriends} w={6} h={6} mr={2} />
        <Text>{members} members</Text>
      </Flex>
      <Flex align="center">
        <Icon as={IoMdArrowRoundForward} w={6} h={6} mr={2} />
        <Text>{splitters} Splitter</Text>
      </Flex>
    </VStack>
  );
};

export default ProjectInfo;