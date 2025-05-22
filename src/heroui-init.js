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
      backgroundColor: props.bg || 'rgba(0, 0, 0, 0.95)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: props.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.2)',
      border: props.borderWidth ? `${props.borderWidth} solid ${props.borderColor || 'rgba(30, 30, 30, 0.8)'}` : 'none'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  CardHeader: function(props) {
    const style = Object.assign({
      padding: props.p || '16px',
      paddingBottom: props.pb,
      borderBottom: '1px solid rgba(40, 40, 40, 0.9)'
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
      fontSize: props.size === "sm" ? "14px" : "16px",
      fontWeight: "500",
      padding: props.size === "sm" ? "6px 12px" : "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease-out",
      outline: "none",
      border: "none",
      width: props.fullWidth ? "100%" : "auto",
      backgroundColor: props.colorScheme === "blue" ? "rgb(15, 128, 255)" : (props.bg || "rgba(50, 50, 50, 0.9)"),
      color: "white",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
    };
    
    // Define hover style
    const hoverStyle = {
      backgroundColor: props.colorScheme === "blue" ? "rgb(30, 143, 255)" : (props._hover?.bg || "rgba(70, 70, 70, 0.9)"),
      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.3)"
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
      gap: props.spacing || '8px'
    }, props.style);
    
    return React.createElement('div', Object.assign({}, props, { style }));
  },
  
  Text: function(props) {
    const style = Object.assign({
      fontSize: props.fontSize || '16px',
      fontWeight: props.fontWeight || 'normal',
      color: props.color || 'white',
      marginBottom: props.mb
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
      boxShadow: props.isChecked ? "0 0 5px rgba(15, 128, 255, 0.5)" : "none"
    };
    
    // Create the thumb element
    const thumbStyle = {
      position: "absolute",
      content: "''",
      height: "16px",
      width: "16px",
      left: props.isChecked ? "21px" : "3px",
      bottom: "2px",
      backgroundColor: "white",
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
      fontSize: "14px",
      padding: "8px 10px",
      background: "rgba(25, 25, 25, 0.9)",
      color: "white",
      width: "100%",
      border: "1px solid rgba(60, 60, 60, 0.9)",
      borderRadius: "4px",
      cursor: "pointer",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      appearance: "none",
      backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center"
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
      borderRadius: "2px",
      background: `linear-gradient(to right, rgb(15, 128, 255) ${valuePercent}%, rgba(40, 40, 40, 0.5) ${valuePercent}%)`,
      outline: "none",
      opacity: props.isDisabled ? "0.5" : "1",
      transition: "background 0.2s ease-out"
    }, props.style);
    
    // Add styles for the thumb
    const thumbStyle = `
      ::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s;
      }
      
      ::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 8px rgba(15, 128, 255, 0.5);
      }
      
      ::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s;
      }
      
      ::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 8px rgba(15, 128, 255, 0.5);
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
  // Track
  const trackStyle = {
    position: "absolute",
    width: "100%",
    height: "4px",
    background: "rgba(40, 40, 40, 0.5)",
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
    background: "rgb(15, 128, 255)",
    borderRadius: "2px",
    top: "50%",
    transform: "translateY(-50%)",
    boxShadow: "0 0 10px rgba(15, 128, 255, 0.3)"
  };
  
  // Min handle dot
  const minDotStyle = {
    position: "absolute",
    left: `${(props.minValue / props.maxLimit) * 100}%`,
    top: "50%",
    width: "14px",
    height: "14px",
    background: "white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    boxShadow: "0 0 5px rgba(0,0,0,0.3)",
    transition: "transform 0.2s"
  };
  
  // Max handle dot
  const maxDotStyle = {
    position: "absolute",
    left: `${(props.maxValue / props.maxLimit) * 100}%`,
    top: "50%",
    width: "14px",
    height: "14px",
    background: "white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    boxShadow: "0 0 5px rgba(0,0,0,0.3)",
    transition: "transform 0.2s"
  };
  
  // Handler functions
  const handleMinChange = (e) => {
    let value = parseInt(e.target.value);
    if (value >= props.maxValue) {
      value = props.maxValue - props.step;
    }
    props.onMinChange(value);
  };
  
  const handleMaxChange = (e) => {
    let value = parseInt(e.target.value);
    if (value <= props.minValue) {
      value = props.minValue + props.step;
    }
    props.onMaxChange(value);
  };
  
  return React.createElement(
    'div',
    {
      style: {
        position: 'relative',
        width: '100%',
        height: '30px',
        margin: '15px 0'
      }
    },
    [
      // Track
      React.createElement('div', { style: trackStyle }),
      
      // Active range
      React.createElement('div', { style: rangeStyle }),
      
      // Min handle dot
      React.createElement('div', { style: minDotStyle }),
      
      // Max handle dot
      React.createElement('div', { style: maxDotStyle }),
      
      // Min input range (hidden but functional)
      React.createElement('input', {
        type: 'range',
        min: props.minLimit,
        max: props.maxLimit,
        step: props.step,
        value: props.minValue,
        onChange: handleMinChange,
        style: {
          position: 'absolute',
          width: '100%',
          height: '7px',
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
          pointerEvents: 'auto',
          zIndex: 1,
          outline: 'none'
        }
      }),
      
      // Max input range (hidden but functional)
      React.createElement('input', {
        type: 'range',
        min: props.minLimit,
        max: props.maxLimit,
        step: props.step,
        value: props.maxValue,
        onChange: handleMaxChange,
        style: {
          position: 'absolute',
          width: '100%',
          height: '7px',
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
          pointerEvents: 'auto',
          zIndex: 1,
          outline: 'none'
        }
      })
    ]
  );
}
};

// Define the BeatIndicator component
window.HeroUI.BeatIndicator = function(props) {
  const containerStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: props.active ? "rgb(15, 128, 255)" : "rgba(30, 30, 30, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s ease-out",
    boxShadow: props.active ? "0 0 15px rgba(15, 128, 255, 0.8)" : "none"
  };
  
  const innerStyle = {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: props.active ? "rgb(15, 128, 255)" : "rgba(40, 40, 40, 0.9)",
    boxShadow: props.active ? "0 0 10px rgba(15, 128, 255, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)" : "none"
  };
  
  const inner = React.createElement('div', { style: innerStyle });
  return React.createElement('div', Object.assign({}, props, { style: containerStyle }), inner);
};

// Log available components
console.log("HeroUI Components Loaded!");
console.log("Available components:", Object.keys(window.HeroUI)); 