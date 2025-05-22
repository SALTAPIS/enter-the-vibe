// Create a simple version of HeroUI components
window.HeroUI = {
  Box: function(props) {
    return React.createElement('div', props, props.children);
  },
  
  Card: function(props) {
    const style = Object.assign({
      background: props.bg || "rgba(0, 0, 0, 0.85)",
      borderColor: props.borderColor || "rgba(255, 255, 255, 0.2)",
      borderWidth: props.borderWidth || "1px",
      borderStyle: "solid",
      borderRadius: "4px",
      boxShadow: props.boxShadow || "0 0 20px rgba(0, 0, 255, 0.3)",
      width: props.width,
      position: props.position,
      top: props.top,
      right: props.right,
      zIndex: props.zIndex,
      color: "white"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  CardHeader: function(props) {
    const style = Object.assign({
      padding: "10px",
      paddingBottom: props.pb ? `${props.pb * 4}px` : undefined,
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  CardBody: function(props) {
    const style = Object.assign({
      padding: props.p ? `${props.p * 4}px` : "15px 10px",
      paddingTop: props.py ? `${props.py * 4}px` : undefined,
      paddingBottom: props.py ? `${props.py * 4}px` : undefined,
      paddingLeft: props.px ? `${props.px * 4}px` : undefined,
      paddingRight: props.px ? `${props.px * 4}px` : undefined
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  CardFooter: function(props) {
    const style = Object.assign({
      padding: "10px",
      paddingTop: props.pt ? `${props.pt * 4}px` : undefined,
      borderTop: "1px solid rgba(255, 255, 255, 0.2)"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  Badge: function(props) {
    const style = Object.assign({
      background: props.colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(255, 255, 255, 0.2)",
      padding: "2px 6px",
      borderRadius: "4px",
      fontSize: props.fontSize === "md" ? "14px" : props.fontSize === "xs" ? "10px" : "12px",
      marginTop: props.mt ? `${props.mt * 4}px` : undefined
    }, props.style);
    
    return React.createElement('span', Object.assign({}, props, { style: style }), props.children);
  },
  
  Button: function(props) {
    const style = Object.assign({
      width: props.width || undefined,
      background: props.variant === "outline" ? "transparent" : 
                 props.colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "transparent",
      border: props.variant === "outline" ? `1px solid ${props.borderColor || "rgba(255, 255, 255, 0.3)"}` : "none",
      padding: props.size === "sm" ? "4px 8px" : "6px 12px",
      borderRadius: "4px",
      color: "white",
      cursor: "pointer",
      fontSize: props.size === "sm" ? "12px" : "14px"
    }, props.style);
    
    return React.createElement('button', Object.assign({}, props, { style: style }), props.children);
  },
  
  Flex: function(props) {
    const style = Object.assign({
      display: "flex",
      flexDirection: props.direction || "row",
      justifyContent: props.justify === "space-between" ? "space-between" : 
                     props.justify === "center" ? "center" : "flex-start",
      alignItems: props.align === "center" ? "center" : "flex-start"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  HStack: function(props) {
    const style = Object.assign({
      display: "flex",
      gap: props.spacing ? `${props.spacing * 4}px` : "8px"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  VStack: function(props) {
    const style = Object.assign({
      display: "flex",
      flexDirection: "column",
      gap: props.spacing ? `${props.spacing * 4}px` : "8px",
      alignItems: props.align === "stretch" ? "stretch" : 
                 props.align === "center" ? "center" : "flex-start"
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style: style }), props.children);
  },
  
  Text: function(props) {
    const style = Object.assign({
      fontSize: props.fontSize === "sm" ? "14px" : props.fontSize === "xs" ? "10px" : "16px",
      marginBottom: props.mb ? `${props.mb * 4}px` : undefined,
      color: props.color || "inherit"
    }, props.style);
    
    return React.createElement('span', Object.assign({}, props, { style: style }), props.children);
  },
  
  Switch: function(props) {
    // Create label element
    const labelStyle = { 
      position: "relative", 
      display: "inline-block", 
      width: "30px", 
      height: "16px" 
    };
    
    // Create the track element
    const trackStyle = {
      position: "absolute",
      cursor: "pointer",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: props.isChecked ? 
        (props.colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(0, 0, 255, 0.6)") : 
        "rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      transition: "0.4s"
    };
    
    // Create the thumb element
    const thumbStyle = {
      position: "absolute",
      content: "''",
      height: "12px",
      width: "12px",
      left: props.isChecked ? "14px" : "2px",
      bottom: "2px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: "0.4s"
    };
    
    // Create the input element
    const inputProps = {
      type: "checkbox",
      checked: props.isChecked,
      onChange: props.onChange,
      style: { opacity: 0, width: 0, height: 0 }
    };
    
    const input = React.createElement('input', inputProps);
    const thumb = React.createElement('span', { style: thumbStyle });
    const track = React.createElement('span', { style: trackStyle }, thumb);
    
    return React.createElement('label', { style: labelStyle }, [input, track]);
  },
  
  Select: function(props) {
    const style = Object.assign({
      fontSize: props.size === "sm" ? "12px" : "14px",
      padding: "4px",
      background: props.bg || "rgba(0, 0, 0, 0.4)",
      borderColor: props.borderColor || "rgba(255, 255, 255, 0.2)",
      color: "white",
      width: "100%",
      marginTop: "4px"
    }, props.style);
    
    return React.createElement('select', Object.assign({}, props, { style: style }), props.children);
  },
  
  Slider: function(props) {
    const style = Object.assign({
      width: "100%",
      WebkitAppearance: "none",
      appearance: "none",
      height: "6px",
      borderRadius: "3px",
      background: "rgba(255, 255, 255, 0.2)",
      outline: "none",
      opacity: props.isDisabled ? "0.5" : "0.8",
      transition: "opacity .2s"
    }, props.style);
    
    return React.createElement('input', Object.assign({}, props, {
      type: "range",
      style: style,
      disabled: props.isDisabled
    }));
  },
  
  Divider: function(props) {
    const style = Object.assign({
      borderColor: "rgba(255, 255, 255, 0.2)",
      margin: "10px 0"
    }, props.style);
    
    return React.createElement('hr', Object.assign({}, props, { style: style }));
  }
};

// Add a specialized component for the beat indicator
window.HeroUI.BeatIndicator = function(props) {
  const containerStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: props.active ? "rgba(66, 153, 225, 0.8)" : "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
    boxShadow: props.active ? "0 0 15px rgba(66, 153, 225, 0.8)" : "none"
  };
  
  const innerStyle = {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: props.active ? "rgba(66, 153, 225, 1)" : "rgba(255, 255, 255, 0.1)",
    boxShadow: props.active ? "0 0 10px rgba(66, 153, 225, 1)" : "none"
  };
  
  const inner = React.createElement('div', { style: innerStyle });
  return React.createElement('div', Object.assign({}, props, { style: containerStyle }), inner);
};

// Add the RangeSlider component
window.HeroUI.RangeSlider = function(props) {
  const handleMinChange = function(e) {
    const newValue = Math.min(parseInt(e.target.value, 10), props.maxValue - props.step);
    props.onMinChange(newValue);
  };
  
  const handleMaxChange = function(e) {
    const newValue = Math.max(parseInt(e.target.value, 10), props.minValue + props.step);
    props.onMaxChange(newValue);
  };
  
  // Container
  const containerStyle = {
    position: "relative",
    height: "24px",
    width: "100%",
    marginTop: "8px"
  };
  
  // Track
  const trackStyle = {
    position: "absolute",
    width: "100%",
    height: "4px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "2px",
    top: "50%",
    transform: "translateY(-50%)"
  };
  
  // Selected range
  const rangeStyle = {
    position: "absolute",
    left: `${(props.minValue / props.maxLimit) * 100}%`,
    width: `${((props.maxValue - props.minValue) / props.maxLimit) * 100}%`,
    height: "4px",
    background: "rgba(66, 153, 225, 0.6)",
    borderRadius: "2px",
    top: "50%",
    transform: "translateY(-50%)"
  };
  
  // Min handle input
  const minHandleProps = {
    type: "range",
    min: props.minLimit,
    max: props.maxLimit,
    step: props.step,
    value: props.minValue,
    onChange: handleMinChange,
    style: {
      position: 'absolute',
      width: '100%',
      height: '14px',
      WebkitAppearance: 'none',
      appearance: 'none',
      background: 'transparent',
      pointerEvents: 'auto',
      zIndex: 1,
      outline: 'none'
    }
  };
  
  // Min handle dot
  const minDotStyle = {
    position: "absolute",
    left: `${(props.minValue / props.maxLimit) * 100}%`,
    top: "50%",
    width: "12px",
    height: "12px",
    background: "white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none"
  };
  
  // Max handle input
  const maxHandleProps = {
    type: "range",
    min: props.minLimit,
    max: props.maxLimit,
    step: props.step,
    value: props.maxValue,
    onChange: handleMaxChange,
    style: {
      position: 'absolute',
      width: '100%',
      height: '14px',
      WebkitAppearance: 'none',
      appearance: 'none',
      background: 'transparent',
      pointerEvents: 'auto',
      zIndex: 2,
      outline: 'none'
    }
  };
  
  // Max handle dot
  const maxDotStyle = {
    position: "absolute",
    left: `${(props.maxValue / props.maxLimit) * 100}%`,
    top: "50%",
    width: "12px",
    height: "12px",
    background: "white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none"
  };
  
  const track = React.createElement('div', { style: trackStyle });
  const range = React.createElement('div', { style: rangeStyle });
  const minHandle = React.createElement('input', minHandleProps);
  const minDot = React.createElement('div', { style: minDotStyle });
  const maxHandle = React.createElement('input', maxHandleProps);
  const maxDot = React.createElement('div', { style: maxDotStyle });
  
  return React.createElement('div', { style: containerStyle }, [
    track,
    range,
    minHandle,
    minDot,
    maxHandle,
    maxDot
  ]);
};

console.log('%c HeroUI Components Loaded! ', 'background: #4299e1; color: white; font-size: 16px; padding: 4px;');
console.log('Available components:', Object.keys(window.HeroUI)); 