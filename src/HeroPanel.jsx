import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Slider,
  Switch,
  Button,
  Stack,
  Text,
  HStack,
  VStack,
  Select,
  Flex,
  Divider,
  Heading,
  IconButton,
  useColorMode,
  Card,
  CardBody,
  CardHeader,
  CardFooter
} from '@heroui/react';

const HeroPanel = ({
  peakThreshold,
  setPeakThreshold,
  noiseFloor,
  setNoiseFloor,
  freqRangeStart,
  setFreqRangeStart,
  freqRangeEnd,
  setFreqRangeEnd,
  autoBeats,
  setAutoBeats,
  beatInterval,
  setBeatInterval,
  displayTime,
  setDisplayTime,
  beatEnergy,
  cutoff,
  beatsDetected,
  onRestart,
  onReset,
  handleFreqRangeChange,
  visible,
  toggleVisibility
}) => {
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  
  // Update the view mode when autoBeats changes
  useEffect(() => {
    setIsSimplifiedView(autoBeats);
  }, [autoBeats]);
  
  // Full featured panel
  const fullPanel = (
    <Card
      width="320px"
      position="fixed"
      top="20px"
      right="20px"
      zIndex={10000}
      bg="rgba(0, 0, 0, 0.85)"
      borderColor="rgba(255, 255, 255, 0.2)"
      borderWidth="1px"
      boxShadow="0 0 20px rgba(0, 0, 255, 0.3)"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.400">Beats Detected</Text>
              <Badge colorScheme="blue" fontSize="md" mt={1}>{beatsDetected}</Badge>
            </Box>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.400">Beat Energy</Text>
              <Badge colorScheme="blue" fontSize="md" mt={1}>{beatEnergy}</Badge>
            </Box>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.400">Cutoff</Text>
              <Badge colorScheme="blue" fontSize="md" mt={1}>{cutoff}</Badge>
            </Box>
          </HStack>
          <Box bg="blue.500" w="40px" h="40px" borderRadius="md"></Box>
        </Flex>
      </CardHeader>
      
      <Divider />
      
      <CardBody py={3}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontSize="sm">Peak Threshold: {peakThreshold.toFixed(2)}</Text>
            <Slider 
              min={0.01} 
              max={0.20} 
              step={0.01} 
              value={peakThreshold}
              onChange={setPeakThreshold}
              colorScheme="blue"
            />
          </Box>
          
          <Box>
            <Text mb={1} fontSize="sm">Noise Floor: {noiseFloor}</Text>
            <Slider 
              min={30} 
              max={150} 
              step={1} 
              value={noiseFloor}
              onChange={setNoiseFloor}
              colorScheme="blue"
            />
          </Box>
          
          <Box>
            <Text mb={1} fontSize="sm">Frequency Focus:</Text>
            <Select 
              size="sm"
              onChange={handleFreqRangeChange}
              bg="rgba(0, 0, 0, 0.5)"
              borderColor="rgba(255, 255, 255, 0.3)"
            >
              <option value="bass">Bass (Low)</option>
              <option value="mid" selected>Mids</option>
              <option value="high">Highs</option>
              <option value="full">Full Spectrum</option>
            </Select>
          </Box>
          
          <Box>
            <Text mb={1} fontSize="sm">Freq Start: {freqRangeStart}</Text>
            <Slider 
              min={0} 
              max={100} 
              step={1} 
              value={freqRangeStart}
              onChange={setFreqRangeStart}
              colorScheme="blue"
            />
          </Box>
          
          <Box>
            <Text mb={1} fontSize="sm">Freq End: {freqRangeEnd}</Text>
            <Slider 
              min={10} 
              max={120} 
              step={1} 
              value={freqRangeEnd}
              onChange={setFreqRangeEnd}
              colorScheme="blue"
            />
          </Box>
          
          <Flex align="center" justify="space-between">
            <Text fontSize="sm">Auto Beats:</Text>
            <Switch 
              isChecked={autoBeats}
              onChange={(e) => setAutoBeats(e.target.checked)}
              colorScheme="blue"
            />
          </Flex>
          
          <Box>
            <Text mb={1} fontSize="sm">Interval: {beatInterval}ms</Text>
            <Slider 
              min={100} 
              max={1000} 
              step={50} 
              value={beatInterval}
              onChange={setBeatInterval}
              colorScheme="blue"
              isDisabled={!autoBeats}
            />
          </Box>
          
          <Box>
            <Text mb={1} fontSize="sm">Display Time: {(displayTime/1000).toFixed(1)}s</Text>
            <Slider 
              min={100} 
              max={2000} 
              step={50} 
              value={displayTime}
              onChange={setDisplayTime}
              colorScheme="blue"
            />
          </Box>
          
          <HStack spacing={3}>
            <Button onClick={onRestart} colorScheme="blue" size="sm" flex={1}>
              Restart
            </Button>
            <Button onClick={onReset} colorScheme="blue" size="sm" flex={1}>
              Reset Settings
            </Button>
          </HStack>
        </VStack>
      </CardBody>
      
      <CardFooter pt={0}>
        <Button 
          onClick={toggleVisibility} 
          width="100%"
          variant="outline"
          size="sm"
          borderColor="rgba(255, 255, 255, 0.3)"
        >
          Hide Controls
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Simplified panel for auto beats mode
  const simplifiedPanel = (
    <Card
      width="320px"
      position="fixed"
      top="20px"
      right="20px"
      zIndex={10000}
      bg="rgba(0, 0, 0, 0.85)"
      borderColor="rgba(255, 255, 255, 0.2)"
      borderWidth="1px"
      boxShadow="0 0 20px rgba(0, 0, 255, 0.3)"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.400">Beats Fired</Text>
            <Badge colorScheme="blue" fontSize="md" mt={1}>{beatsDetected}</Badge>
          </Box>
          <Box bg="blue.500" w="40px" h="40px" borderRadius="md"></Box>
        </Flex>
      </CardHeader>
      
      <CardBody py={3}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontSize="sm">Interval: {beatInterval}ms</Text>
            <Slider 
              min={100} 
              max={1000} 
              step={50} 
              value={beatInterval}
              onChange={setBeatInterval}
              colorScheme="blue"
            />
          </Box>
          
          <Flex align="center" justify="space-between">
            <Text fontSize="sm">Auto Beats:</Text>
            <Switch 
              isChecked={autoBeats}
              onChange={(e) => setAutoBeats(e.target.checked)}
              colorScheme="blue"
            />
          </Flex>
        </VStack>
      </CardBody>
      
      <CardFooter pt={0}>
        <Button 
          onClick={toggleVisibility} 
          width="100%"
          variant="outline"
          size="sm"
          borderColor="rgba(255, 255, 255, 0.3)"
        >
          Hide Controls
        </Button>
      </CardFooter>
    </Card>
  );
  
  if (!visible) return null;
  
  return isSimplifiedView ? simplifiedPanel : fullPanel;
};

export default HeroPanel; 