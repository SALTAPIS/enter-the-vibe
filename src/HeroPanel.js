import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Slider,
  Switch,
  Select
} from '@heroui/react';

// Create component
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
  toggleVisibility,
  peakDetected
}) => {
  // Create state for simplified view
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  const [isActive, setIsActive] = useState(peakDetected || false);
  
  // Update the view mode when autoBeats changes
  useEffect(() => {
    setIsSimplifiedView(autoBeats);
  }, [autoBeats]);
  
  // Update active state when peakDetected changes
  useEffect(() => {
    setIsActive(peakDetected);
  }, [peakDetected]);
  
  // Create a range slider component with two handles
  const RangeSlider = ({ minValue, maxValue, minLimit, maxLimit, step, onMinChange, onMaxChange }) => {
    // Handle range change
    const handleMinChange = (e) => {
      const newValue = Math.min(parseInt(e.target.value, 10), maxValue - step);
      onMinChange(newValue);
    };
    
    const handleMaxChange = (e) => {
      const newValue = Math.max(parseInt(e.target.value, 10), minValue + step);
      onMaxChange(newValue);
    };
    
    return (
      <Box position="relative" height="24px" width="100%" mt="8px">
        {/* Slider track */}
        <Box
          position="absolute"
          width="100%"
          height="4px"
          bg="rgba(255, 255, 255, 0.2)"
          borderRadius="2px"
          top="50%"
          transform="translateY(-50%)"
        />
        
        {/* Selected range */}
        <Box
          position="absolute"
          left={`${(minValue / maxLimit) * 100}%`}
          width={`${((maxValue - minValue) / maxLimit) * 100}%`}
          height="4px"
          bg="rgba(66, 153, 225, 0.6)"
          borderRadius="2px"
          top="50%"
          transform="translateY(-50%)"
        />
        
        {/* Min handle */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: '7px',
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            pointerEvents: 'auto',
            zIndex: 2,
            outline: 'none'
          }}
        />
        
        {/* Max handle */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: '7px',
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            pointerEvents: 'auto',
            zIndex: 1,
            outline: 'none'
          }}
        />
      </Box>
    );
  };
  
  // Custom beat indicator component
  const BeatIndicator = ({ active }) => {
    return (
      <Box
        width="40px"
        height="40px"
        borderRadius="50%"
        bg={active ? "rgba(66, 153, 225, 0.8)" : "rgba(255, 255, 255, 0.2)"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.1s"
        boxShadow={active ? "0 0 15px rgba(66, 153, 225, 0.8)" : "none"}
      >
        <Box
          width="30px"
          height="30px"
          borderRadius="50%"
          bg={active ? "rgba(66, 153, 225, 1)" : "rgba(255, 255, 255, 0.1)"}
          boxShadow={active ? "0 0 10px rgba(66, 153, 225, 1)" : "none"}
        />
      </Box>
    );
  };
  
  // If not visible, just show the collapsed control
  if (!visible) {
    return (
      <Card
        position="fixed"
        top="20px"
        right="20px"
        width="50px"
        bg="rgba(0, 0, 0, 0.6)"
        borderColor="rgba(255, 255, 255, 0.2)"
        borderWidth="1px"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.5)"
        zIndex="10"
      >
        <CardBody>
          <VStack spacing={2}>
            <BeatIndicator active={isActive} />
            <Button size="sm" onClick={toggleVisibility}>Show</Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  // Main control panel
  return (
    <Card
      position="fixed"
      top="20px"
      right="20px"
      width="300px"
      bg="rgba(0, 0, 0, 0.6)"
      borderColor="rgba(255, 255, 255, 0.2)"
      borderWidth="1px"
      boxShadow="0 0 10px rgba(0, 0, 0, 0.5)"
      zIndex="10"
    >
      <CardHeader pb={0}>
        <HStack spacing={2}>
          <Text>Beat Controls</Text>
          <BeatIndicator active={isActive} />
          <Box flex="1" />
          <Button size="sm" onClick={toggleVisibility}>Hide</Button>
        </HStack>
      </CardHeader>
      
      <CardBody py={2}>
        <VStack spacing={3} align="stretch">
          {/* Beat Detection Settings */}
          <Box>
            <HStack spacing={2}>
              <Text fontSize="sm">Peak Threshold: {peakThreshold.toFixed(2)}</Text>
              <Badge colorScheme="blue" fontSize="xs">{Math.round(beatEnergy * 100)}</Badge>
            </HStack>
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
            <Text fontSize="sm">Noise Floor: {noiseFloor}</Text>
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
            <Text fontSize="sm">Frequency Focus:</Text>
            <Select
              size="sm"
              bg="rgba(0, 0, 0, 0.4)"
              borderColor="rgba(255, 255, 255, 0.2)"
              onChange={(e) => handleFreqRangeChange(e.target.value)}
              value={
                freqRangeStart === 0 && freqRangeEnd === 20 ? "bass" :
                freqRangeStart === 10 && freqRangeEnd === 60 ? "mid" :
                freqRangeStart === 50 && freqRangeEnd === 100 ? "high" :
                freqRangeStart === 0 && freqRangeEnd === 120 ? "full" : "custom"
              }
            >
              <option value="bass">Bass (Low)</option>
              <option value="mid">Mids</option>
              <option value="high">Highs</option>
              <option value="full">Full Spectrum</option>
              <option value="custom">Custom Range</option>
            </Select>
          </Box>
          
          {/* Only show the custom range controls in expanded view */}
          {!isSimplifiedView && (
            <Box>
              <HStack spacing={2}>
                <Text fontSize="xs">Start: {freqRangeStart}</Text>
                <Box flex="1" />
                <Text fontSize="xs">End: {freqRangeEnd}</Text>
              </HStack>
              <RangeSlider
                minValue={freqRangeStart}
                maxValue={freqRangeEnd}
                minLimit={0}
                maxLimit={120}
                step={1}
                onMinChange={setFreqRangeStart}
                onMaxChange={setFreqRangeEnd}
              />
            </Box>
          )}
          
          <Divider />
          
          {/* Auto Beats Controls */}
          <HStack>
            <Text fontSize="sm">Auto Beats:</Text>
            <Box flex="1" />
            <Switch
              isChecked={autoBeats}
              onChange={(e) => setAutoBeats(e.target.checked)}
              colorScheme="blue"
            />
          </HStack>
          
          {autoBeats && (
            <Box>
              <Text fontSize="sm">Interval: {beatInterval}ms</Text>
              <Slider
                min={100}
                max={1000}
                step={50}
                value={beatInterval}
                onChange={setBeatInterval}
                colorScheme="blue"
              />
            </Box>
          )}
          
          <Box>
            <Text fontSize="sm">Display Time: {(displayTime/1000).toFixed(1)}s</Text>
            <Slider
              min={100}
              max={2000}
              step={50}
              value={displayTime}
              onChange={setDisplayTime}
              colorScheme="blue"
            />
          </Box>
          
          <Divider />
          
          {/* Debug Info */}
          <Box>
            <Text fontSize="xs" color="gray.400">Energy: {beatEnergy}</Text>
            <Text fontSize="xs" color="gray.400">Cutoff: {cutoff}</Text>
            <Text fontSize="xs" color="gray.400">Beats: {beatsDetected}</Text>
          </Box>
        </VStack>
      </CardBody>
      
      <CardFooter pt={0}>
        <HStack spacing={2}>
          <Button onClick={onRestart} flex="1" size="sm">Restart</Button>
          <Button onClick={onReset} flex="1" size="sm" variant="outline">Reset Settings</Button>
        </HStack>
      </CardFooter>
    </Card>
  );
};

// Export the component
export default HeroPanel;

// For backwards compatibility with the global approach
window.HeroPanel = HeroPanel; 