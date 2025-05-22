import React from 'react';

// Basic components that mimic HeroUI functionality
export const Box = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const Card = ({ children, width, position, top, right, zIndex, bg, borderColor, borderWidth, boxShadow, ...props }) => (
  <div style={{
    width,
    position,
    top,
    right,
    zIndex,
    background: bg || "rgba(0, 0, 0, 0.85)",
    borderColor: borderColor || "rgba(255, 255, 255, 0.2)",
    borderWidth: borderWidth || "1px",
    borderStyle: "solid",
    borderRadius: "4px",
    boxShadow: boxShadow || "0 0 20px rgba(0, 0, 255, 0.3)",
    color: "white",
    ...props.style
  }} {...props}>{children}</div>
);

export const CardHeader = ({ children, pb, ...props }) => (
  <div style={{
    padding: "10px",
    paddingBottom: pb ? `${pb * 4}px` : undefined,
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    ...props.style
  }} {...props}>{children}</div>
);

export const CardBody = ({ children, py, p, px, ...props }) => (
  <div style={{
    padding: p ? `${p * 4}px` : "15px 10px",
    paddingTop: py ? `${py * 4}px` : undefined,
    paddingBottom: py ? `${py * 4}px` : undefined,
    paddingLeft: px ? `${px * 4}px` : undefined,
    paddingRight: px ? `${px * 4}px` : undefined,
    ...props.style
  }} {...props}>{children}</div>
);

export const CardFooter = ({ children, pt, ...props }) => (
  <div style={{
    padding: "10px",
    paddingTop: pt ? `${pt * 4}px` : undefined,
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    ...props.style
  }} {...props}>{children}</div>
);

export const Badge = ({ children, colorScheme, fontSize, mt, ...props }) => (
  <span style={{
    background: colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(255, 255, 255, 0.2)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: fontSize === "md" ? "14px" : fontSize === "xs" ? "10px" : "12px",
    marginTop: mt ? `${mt * 4}px` : undefined,
    ...props.style
  }} {...props}>{children}</span>
);

export const Button = ({ children, onClick, colorScheme, variant, width, size, borderColor, ...props }) => (
  <button 
    onClick={onClick}
    style={{
      width: width || undefined,
      background: variant === "outline" ? "transparent" : 
                 colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "transparent",
      border: variant === "outline" ? `1px solid ${borderColor || "rgba(255, 255, 255, 0.3)"}` : "none",
      padding: size === "sm" ? "4px 8px" : "6px 12px",
      borderRadius: "4px",
      color: "white",
      cursor: "pointer",
      fontSize: size === "sm" ? "12px" : "14px",
      ...props.style
    }} 
    {...props}
  >
    {children}
  </button>
);

export const Flex = ({ children, justify, align, direction, ...props }) => (
  <div style={{
    display: "flex",
    flexDirection: direction || "row",
    justifyContent: justify === "space-between" ? "space-between" : 
                   justify === "center" ? "center" : "flex-start",
    alignItems: align === "center" ? "center" : "flex-start",
    ...props.style
  }} {...props}>{children}</div>
);

export const HStack = ({ children, spacing, ...props }) => (
  <div style={{
    display: "flex",
    gap: spacing ? `${spacing * 4}px` : "8px",
    ...props.style
  }} {...props}>{children}</div>
);

export const VStack = ({ children, spacing, align, ...props }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    gap: spacing ? `${spacing * 4}px` : "8px",
    alignItems: align === "stretch" ? "stretch" : 
                align === "center" ? "center" : "flex-start",
    ...props.style
  }} {...props}>{children}</div>
);

export const Text = ({ children, fontSize, mb, color, ...props }) => (
  <span style={{
    fontSize: fontSize === "sm" ? "14px" : fontSize === "xs" ? "10px" : "16px",
    marginBottom: mb ? `${mb * 4}px` : undefined,
    color: color || "inherit",
    ...props.style
  }} {...props}>{children}</span>
);

export const Switch = ({ isChecked, onChange, colorScheme, ...props }) => (
  <label style={{position: "relative", display: "inline-block", width: "30px", height: "16px", ...props.style}}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      style={{opacity: 0, width: 0, height: 0}}
    />
    <span style={{
      position: "absolute",
      cursor: "pointer",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isChecked ? 
        (colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(0, 0, 255, 0.6)") : 
        "rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      transition: "0.4s"
    }}>
      <span style={{
        position: "absolute",
        content: "''",
        height: "12px",
        width: "12px",
        left: isChecked ? "14px" : "2px",
        bottom: "2px",
        backgroundColor: "white",
        borderRadius: "50%",
        transition: "0.4s"
      }}></span>
    </span>
  </label>
);

export const Select = ({ children, onChange, value, size, bg, borderColor, ...props }) => (
  <select 
    onChange={onChange}
    value={value}
    style={{
      fontSize: size === "sm" ? "12px" : "14px",
      padding: "4px",
      background: bg || "rgba(0, 0, 0, 0.4)",
      borderColor: borderColor || "rgba(255, 255, 255, 0.2)",
      color: "white",
      width: "100%",
      marginTop: "4px",
      ...props.style
    }}
    {...props}
  >
    {children}
  </select>
);

export const Slider = ({ min, max, step, value, onChange, colorScheme, isDisabled, ...props }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={onChange}
    disabled={isDisabled}
    style={{
      width: "100%",
      WebkitAppearance: "none",
      appearance: "none",
      height: "6px",
      borderRadius: "3px",
      background: "rgba(255, 255, 255, 0.2)",
      outline: "none",
      opacity: isDisabled ? "0.5" : "0.8",
      transition: "opacity .2s",
      ...props.style
    }}
    {...props}
  />
);

export const Divider = ({ ...props }) => (
  <hr style={{
    borderColor: "rgba(255, 255, 255, 0.2)",
    margin: "10px 0",
    ...props.style
  }} {...props} />
);

// Additional custom component for beat detection visualization
export const BeatIndicator = ({ active, ...props }) => (
  <Box
    width="40px"
    height="40px"
    borderRadius="50%"
    bg={active ? "rgba(66, 153, 225, 0.8)" : "rgba(255, 255, 255, 0.2)"}
    display="flex"
    alignItems="center"
    justifyContent="center"
    style={{ 
      transition: "all 0.1s",
      boxShadow: active ? "0 0 15px rgba(66, 153, 225, 0.8)" : "none",
      ...props.style
    }}
    {...props}
  >
    <Box
      width="30px"
      height="30px"
      borderRadius="50%"
      bg={active ? "rgba(66, 153, 225, 1)" : "rgba(255, 255, 255, 0.1)"}
      style={{ boxShadow: active ? "0 0 10px rgba(66, 153, 225, 1)" : "none" }}
    />
  </Box>
);

// Simplified Range Slider component
export const RangeSlider = ({ minValue, maxValue, minLimit, maxLimit, step, onMinChange, onMaxChange }) => {
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
        style={{ transform: "translateY(-50%)" }}
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
        style={{ transform: "translateY(-50%)" }}
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
          height: '14px', 
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
          pointerEvents: 'auto',
          zIndex: 1,
          outline: 'none'
        }}
      />

      {/* Min handle visible dot */}
      <Box
        position="absolute"
        left={`${(minValue / maxLimit) * 100}%`}
        top="50%"
        width="12px"
        height="12px"
        bg="white"
        borderRadius="50%"
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "none" }}
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
          height: '14px',
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
          pointerEvents: 'auto',
          zIndex: 2,
          outline: 'none'
        }}
      />

      {/* Max handle visible dot */}
      <Box
        position="absolute"
        left={`${(maxValue / maxLimit) * 100}%`}
        top="50%"
        width="12px"
        height="12px"
        bg="white"
        borderRadius="50%"
        style={{ transform: "translate(-50%, -50%)", pointerEvents: "none" }}
      />
    </Box>
  );
};

// Export all components as a single object for compatibility with window.HeroUI
const HeroUI = {
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  Flex,
  HStack,
  VStack,
  Text,
  Switch,
  Select,
  Slider,
  Divider,
  BeatIndicator,
  RangeSlider
};

export default HeroUI; 