// Create HeroUI components
window.HeroUI = {
  Box: function(props) {
    const style = Object.assign({
      boxSizing: 'border-box'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  Card: function(props) {
    const style = Object.assign({
      backgroundColor: props.bg || 'rgba(22, 22, 22, 0.95)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: props.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.4)',
      border: props.borderWidth ? `${props.borderWidth} solid ${props.borderColor || 'rgba(40, 40, 40, 0.8)'}` : 'none'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  CardHeader: function(props) {
    const style = Object.assign({
      padding: props.p || '16px',
      paddingBottom: props.pb,
      borderBottom: '1px solid rgba(40, 40, 40, 0.9)',
      background: 'rgba(20, 20, 20, 0.9)'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  CardBody: function(props) {
    const style = Object.assign({
      padding: props.p || '16px',
      paddingTop: props.pt
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  CardFooter: function(props) {
    const style = Object.assign({
      padding: '16px',
      borderTop: '1px solid rgba(40, 40, 40, 0.9)'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  Badge: function(props) {
    const colorSchemes = {
      blue: {
        bg: 'rgba(15, 128, 255, 0.9)',
        color: 'white'
      }
    };
    
    const colorScheme = colorSchemes[props.colorScheme] || colorSchemes.blue;
    
    const style = Object.assign({
      backgroundColor: colorScheme.bg,
      color: colorScheme.color,
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    }, props.style);
    
    return React.createElement('span', Object.assign({}, props, { style }));
  },
  
  Button: function(props) {
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: props.size === "sm" ? "13px" : "14px",
      fontWeight: "500",
      padding: props.size === "sm" ? "6px 12px" : "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease-out",
      outline: "none",
      border: props.colorScheme === "blue" ? "none" : "1px solid rgba(60, 60, 60, 0.9)",
      width: props.fullWidth ? "100%" : "auto",
      backgroundColor: props.colorScheme === "blue" ? "rgb(15, 128, 255)" : (props.bg || "rgba(30, 30, 30, 0.9)"),
      color: "white",
      boxShadow: props.colorScheme === "blue" ? "0 2px 8px rgba(15, 128, 255, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.2)",
      margin: "4px 0"
    };
    
    // Define hover style
    const hoverStyle = {
      backgroundColor: props.colorScheme === "blue" ? "rgb(30, 143, 255)" : (props._hover?.bg || "rgba(50, 50, 50, 0.9)"),
      boxShadow: props.colorScheme === "blue" ? "0 4px 12px rgba(15, 128, 255, 0.4)" : "0 3px 6px rgba(0, 0, 0, 0.3)",
      transform: "translateY(-1px)"
    };
    
    // Track hover state
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Combine styles based on hover state
    const style = Object.assign(
      {},
      baseStyle,
      isHovered ? hoverStyle : {},
      props.style
    );
    
    // Create props with event handlers for hover
    const buttonProps = Object.assign({}, props, {
      style,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false)
    });
    
    return React.createElement('button', buttonProps);
  },
  
  Flex: function(props) {
    const style = Object.assign({
      display: 'flex',
      flexDirection: props.direction || 'row',
      alignItems: props.align || 'stretch',
      justifyContent: props.justify || 'flex-start',
      gap: props.gap,
      marginBottom: props.mb,
      marginTop: props.mt
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  HStack: function(props) {
    const style = Object.assign({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: props.spacing || '8px'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  VStack: function(props) {
    const style = Object.assign({
      display: 'flex',
      flexDirection: 'column',
      alignItems: props.align || 'stretch',
      gap: props.spacing || '18px'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  Text: function(props) {
    const style = Object.assign({
      fontSize: props.fontSize || '12px',
      fontWeight: props.fontWeight || 'normal',
      color: props.color || 'rgba(180, 180, 180, 0.9)',
      marginBottom: props.mb || '8px',
      letterSpacing: '-0.01em',
      lineHeight: '1.4'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  Switch: function(props) {
    // Create label element
    const labelStyle = { 
      position: "relative", 
      display: "inline-block", 
      width: "40px", 
      height: "20px",
      cursor: "pointer"
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
        "rgb(15, 128, 255)" : 
        "rgba(40, 40, 40, 0.5)",
      borderRadius: "10px",
      transition: "0.2s ease-out",
      boxShadow: props.isChecked ? "0 0 6px rgba(15, 128, 255, 0.6)" : "none",
      border: props.isChecked ? "none" : "1px solid rgba(50, 50, 50, 0.9)"
    };
    
    // Create the thumb element
    const thumbStyle = {
      position: "absolute",
      content: "''",
      height: "16px",
      width: "16px",
      left: props.isChecked ? "21px" : "3px",
      bottom: "2px",
      backgroundColor: props.isChecked ? "white" : "#e0e0e0",
      borderRadius: "50%",
      transition: "0.3s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
    };
    
    // Create input element (hidden)
    const inputProps = {
      type: "checkbox",
      checked: props.isChecked,
      onChange: props.onChange,
      style: {
        opacity: 0,
        width: 0,
        height: 0
      }
    };
    
    // Create the track and thumb elements
    const trackElement = React.createElement('span', { style: trackStyle });
    const thumbElement = React.createElement('span', { style: thumbStyle });
    
    // Create the input element
    const inputElement = React.createElement('input', inputProps);
    
    // Combine everything into a label
    return React.createElement(
      'label',
      { style: labelStyle },
      [inputElement, trackElement, thumbElement]
    );
  },
  
  Select: function(props) {
    const style = Object.assign({
      fontSize: "12px",
      padding: "8px 10px",
      background: "rgba(30, 30, 30, 0.9)",
      color: "rgba(180, 180, 180, 0.9)",
      width: "100%",
      border: "1px solid rgba(50, 50, 50, 0.9)",
      borderRadius: "4px",
      cursor: "pointer",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      appearance: "none",
      backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      margin: "4px 0 8px 0"
    }, props.style);
    
    return React.createElement('select', Object.assign({}, props, { style }));
  },
  
  Slider: function(props) {
    const valuePercent = ((props.value - props.min) / (props.max - props.min)) * 100;
    
    const style = Object.assign({
      width: "100%",
      WebkitAppearance: "none",
      appearance: "none",
      height: "4px",
      borderRadius: "4px",
      background: `linear-gradient(to right, rgb(15, 128, 255) ${valuePercent}%, rgba(40, 40, 40, 0.5) ${valuePercent}%)`,
      outline: "none",
      opacity: props.isDisabled ? "0.5" : "1",
      transition: "background 0.2s ease-out",
      margin: "8px 0"
    }, props.style);
    
    // Add styles for the thumb
    const thumbStyle = `
      ::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s;
        border: 1px solid rgba(15, 128, 255, 0.6);
      }
      
      ::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 8px rgba(15, 128, 255, 0.6);
      }
      
      ::-webkit-slider-thumb:active {
        background: rgba(15, 128, 255, 0.9);
      }
      
      ::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s;
        border: 1px solid rgba(15, 128, 255, 0.6);
      }
      
      ::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 8px rgba(15, 128, 255, 0.6);
      }
      
      ::-moz-range-thumb:active {
        background: rgba(15, 128, 255, 0.9);
      }
    `;
    
    return React.createElement(
      'div',
      { style: { position: 'relative', width: '100%' } },
      [
        React.createElement('style', null, thumbStyle),
        React.createElement('input', Object.assign({}, props, {
          type: 'range',
          style: style
        }))
      ]
    );
  },
  
  Divider: function(props) {
    const style = Object.assign({
      width: '100%',
      height: '1px',
      backgroundColor: 'rgba(60, 60, 60, 0.6)',
      margin: '8px 0'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  RangeSlider: function(props) {
    const containerStyle = {
      position: 'relative',
      width: '100%',
      height: '30px',
      margin: '15px 0'
    };

    // Simple track
    const trackStyle = {
      position: 'absolute',
      width: '100%',
      height: '4px',
      background: 'rgba(40, 40, 40, 0.5)',
      borderRadius: '4px',
      top: '50%',
      transform: 'translateY(-50%)'
    };

    // Selected range
    const selectedRangeStyle = {
      position: 'absolute',
      left: `${(props.minValue / props.maxLimit) * 100}%`,
      width: `${((props.maxValue - props.minValue) / props.maxLimit) * 100}%`,
      height: '4px',
      background: 'rgb(15, 128, 255)',
      borderRadius: '4px',
      top: '50%',
      transform: 'translateY(-50%)'
    };

    // Handle styles
    const minHandleStyle = {
      position: 'absolute',
      left: `${(props.minValue / props.maxLimit) * 100}%`,
      top: '50%',
      width: '16px',
      height: '16px',
      background: 'white',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      border: '1px solid rgba(15, 128, 255, 0.6)',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none'
    };

    const maxHandleStyle = {
      position: 'absolute',
      left: `${(props.maxValue / props.maxLimit) * 100}%`,
      top: '50%',
      width: '16px',
      height: '16px',
      background: 'white',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      border: '1px solid rgba(15, 128, 255, 0.6)',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none'
    };

    // Range input style
    const rangeInputStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      opacity: 0,
      cursor: 'pointer'
    };

    // Min value change handler
    const handleMinChange = (e) => {
      const value = parseInt(e.target.value);
      props.onMinChange(Math.min(value, props.maxValue - props.step));
    };

    // Max value change handler
    const handleMaxChange = (e) => {
      const value = parseInt(e.target.value);
      props.onMaxChange(Math.max(value, props.minValue + props.step));
    };

    return React.createElement('div', { style: containerStyle }, [
      // Track
      React.createElement('div', { style: trackStyle }),
      
      // Selected range
      React.createElement('div', { style: selectedRangeStyle }),
      
      // Min handle visual
      React.createElement('div', { style: minHandleStyle }),
      
      // Max handle visual
      React.createElement('div', { style: maxHandleStyle }),
      
      // Min value input - covers left half
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          overflow: 'hidden'
        }
      }, 
        React.createElement('input', {
          type: 'range',
          min: props.minLimit,
          max: props.maxLimit,
          step: props.step,
          value: props.minValue,
          onChange: handleMinChange,
          style: rangeInputStyle
        })
      ),
      
      // Max value input - covers right half
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          overflow: 'hidden'
        }
      }, 
        React.createElement('input', {
          type: 'range',
          min: props.minLimit,
          max: props.maxLimit,
          step: props.step,
          value: props.maxValue,
          onChange: handleMaxChange,
          style: rangeInputStyle
        })
      )
    ]);
  },
};

// Define the BeatIndicator component
window.HeroUI.BeatIndicator = function(props) {
  const containerStyle = {
    width: props.large ? "70px" : "40px",
    height: props.large ? "70px" : "40px",
    borderRadius: "50%",
    background: props.active ? "rgb(15, 128, 255)" : "rgba(30, 30, 30, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-out",
    boxShadow: props.active ? "0 0 20px rgba(15, 128, 255, 0.8)" : "none"
  };
  
  const innerStyle = {
    width: props.large ? "50px" : "26px",
    height: props.large ? "50px" : "26px",
    borderRadius: "50%",
    background: props.active ? "rgb(15, 128, 255)" : "rgba(40, 40, 40, 0.9)",
    boxShadow: props.active ? "0 0 15px rgba(15, 128, 255, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)" : "none"
  };
  
  const inner = React.createElement('div', { style: innerStyle });
  return React.createElement('div', Object.assign({}, props, { style: containerStyle }), inner);
};

// Log available components
console.log("HeroUI Components Loaded!");
console.log("Available components:", Object.keys(window.HeroUI)); 