"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

// Basic components that mimic HeroUI functionality
var Box = function Box(_ref) {
  var children = _ref.children;

  var props = _objectWithoutProperties(_ref, ["children"]);

  return _react2["default"].createElement(
    "div",
    props,
    children
  );
};

exports.Box = Box;
var Card = function Card(_ref2) {
  var children = _ref2.children;
  var width = _ref2.width;
  var position = _ref2.position;
  var top = _ref2.top;
  var right = _ref2.right;
  var zIndex = _ref2.zIndex;
  var bg = _ref2.bg;
  var borderColor = _ref2.borderColor;
  var borderWidth = _ref2.borderWidth;
  var boxShadow = _ref2.boxShadow;

  var props = _objectWithoutProperties(_ref2, ["children", "width", "position", "top", "right", "zIndex", "bg", "borderColor", "borderWidth", "boxShadow"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        width: width,
        position: position,
        top: top,
        right: right,
        zIndex: zIndex,
        background: bg || "rgba(0, 0, 0, 0.85)",
        borderColor: borderColor || "rgba(255, 255, 255, 0.2)",
        borderWidth: borderWidth || "1px",
        borderStyle: "solid",
        borderRadius: "4px",
        boxShadow: boxShadow || "0 0 20px rgba(0, 0, 255, 0.3)",
        color: "white"
      }, props.style) }, props),
    children
  );
};

exports.Card = Card;
var CardHeader = function CardHeader(_ref3) {
  var children = _ref3.children;
  var pb = _ref3.pb;

  var props = _objectWithoutProperties(_ref3, ["children", "pb"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        padding: "10px",
        paddingBottom: pb ? pb * 4 + "px" : undefined,
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
      }, props.style) }, props),
    children
  );
};

exports.CardHeader = CardHeader;
var CardBody = function CardBody(_ref4) {
  var children = _ref4.children;
  var py = _ref4.py;
  var p = _ref4.p;
  var px = _ref4.px;

  var props = _objectWithoutProperties(_ref4, ["children", "py", "p", "px"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        padding: p ? p * 4 + "px" : "15px 10px",
        paddingTop: py ? py * 4 + "px" : undefined,
        paddingBottom: py ? py * 4 + "px" : undefined,
        paddingLeft: px ? px * 4 + "px" : undefined,
        paddingRight: px ? px * 4 + "px" : undefined
      }, props.style) }, props),
    children
  );
};

exports.CardBody = CardBody;
var CardFooter = function CardFooter(_ref5) {
  var children = _ref5.children;
  var pt = _ref5.pt;

  var props = _objectWithoutProperties(_ref5, ["children", "pt"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        padding: "10px",
        paddingTop: pt ? pt * 4 + "px" : undefined,
        borderTop: "1px solid rgba(255, 255, 255, 0.2)"
      }, props.style) }, props),
    children
  );
};

exports.CardFooter = CardFooter;
var Badge = function Badge(_ref6) {
  var children = _ref6.children;
  var colorScheme = _ref6.colorScheme;
  var fontSize = _ref6.fontSize;
  var mt = _ref6.mt;

  var props = _objectWithoutProperties(_ref6, ["children", "colorScheme", "fontSize", "mt"]);

  return _react2["default"].createElement(
    "span",
    _extends({ style: _extends({
        background: colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(255, 255, 255, 0.2)",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: fontSize === "md" ? "14px" : fontSize === "xs" ? "10px" : "12px",
        marginTop: mt ? mt * 4 + "px" : undefined
      }, props.style) }, props),
    children
  );
};

exports.Badge = Badge;
var Button = function Button(_ref7) {
  var children = _ref7.children;
  var onClick = _ref7.onClick;
  var colorScheme = _ref7.colorScheme;
  var variant = _ref7.variant;
  var width = _ref7.width;
  var size = _ref7.size;
  var borderColor = _ref7.borderColor;

  var props = _objectWithoutProperties(_ref7, ["children", "onClick", "colorScheme", "variant", "width", "size", "borderColor"]);

  return _react2["default"].createElement(
    "button",
    _extends({
      onClick: onClick,
      style: _extends({
        width: width || undefined,
        background: variant === "outline" ? "transparent" : colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "transparent",
        border: variant === "outline" ? "1px solid " + (borderColor || "rgba(255, 255, 255, 0.3)") : "none",
        padding: size === "sm" ? "4px 8px" : "6px 12px",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
        fontSize: size === "sm" ? "12px" : "14px"
      }, props.style)
    }, props),
    children
  );
};

exports.Button = Button;
var Flex = function Flex(_ref8) {
  var children = _ref8.children;
  var justify = _ref8.justify;
  var align = _ref8.align;
  var direction = _ref8.direction;

  var props = _objectWithoutProperties(_ref8, ["children", "justify", "align", "direction"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        display: "flex",
        flexDirection: direction || "row",
        justifyContent: justify === "space-between" ? "space-between" : justify === "center" ? "center" : "flex-start",
        alignItems: align === "center" ? "center" : "flex-start"
      }, props.style) }, props),
    children
  );
};

exports.Flex = Flex;
var HStack = function HStack(_ref9) {
  var children = _ref9.children;
  var spacing = _ref9.spacing;

  var props = _objectWithoutProperties(_ref9, ["children", "spacing"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        display: "flex",
        gap: spacing ? spacing * 4 + "px" : "8px"
      }, props.style) }, props),
    children
  );
};

exports.HStack = HStack;
var VStack = function VStack(_ref10) {
  var children = _ref10.children;
  var spacing = _ref10.spacing;
  var align = _ref10.align;

  var props = _objectWithoutProperties(_ref10, ["children", "spacing", "align"]);

  return _react2["default"].createElement(
    "div",
    _extends({ style: _extends({
        display: "flex",
        flexDirection: "column",
        gap: spacing ? spacing * 4 + "px" : "8px",
        alignItems: align === "stretch" ? "stretch" : align === "center" ? "center" : "flex-start"
      }, props.style) }, props),
    children
  );
};

exports.VStack = VStack;
var Text = function Text(_ref11) {
  var children = _ref11.children;
  var fontSize = _ref11.fontSize;
  var mb = _ref11.mb;
  var color = _ref11.color;

  var props = _objectWithoutProperties(_ref11, ["children", "fontSize", "mb", "color"]);

  return _react2["default"].createElement(
    "span",
    _extends({ style: _extends({
        fontSize: fontSize === "sm" ? "14px" : fontSize === "xs" ? "10px" : "16px",
        marginBottom: mb ? mb * 4 + "px" : undefined,
        color: color || "inherit"
      }, props.style) }, props),
    children
  );
};

exports.Text = Text;
var Switch = function Switch(_ref12) {
  var isChecked = _ref12.isChecked;
  var onChange = _ref12.onChange;
  var colorScheme = _ref12.colorScheme;

  var props = _objectWithoutProperties(_ref12, ["isChecked", "onChange", "colorScheme"]);

  return _react2["default"].createElement(
    "label",
    { style: _extends({ position: "relative", display: "inline-block", width: "30px", height: "16px" }, props.style) },
    _react2["default"].createElement("input", {
      type: "checkbox",
      checked: isChecked,
      onChange: onChange,
      style: { opacity: 0, width: 0, height: 0 }
    }),
    _react2["default"].createElement(
      "span",
      { style: {
          position: "absolute",
          cursor: "pointer",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isChecked ? colorScheme === "blue" ? "rgba(66, 153, 225, 0.6)" : "rgba(0, 0, 255, 0.6)" : "rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          transition: "0.4s"
        } },
      _react2["default"].createElement("span", { style: {
          position: "absolute",
          content: "''",
          height: "12px",
          width: "12px",
          left: isChecked ? "14px" : "2px",
          bottom: "2px",
          backgroundColor: "white",
          borderRadius: "50%",
          transition: "0.4s"
        } })
    )
  );
};

exports.Switch = Switch;
var Select = function Select(_ref13) {
  var children = _ref13.children;
  var onChange = _ref13.onChange;
  var value = _ref13.value;
  var size = _ref13.size;
  var bg = _ref13.bg;
  var borderColor = _ref13.borderColor;

  var props = _objectWithoutProperties(_ref13, ["children", "onChange", "value", "size", "bg", "borderColor"]);

  return _react2["default"].createElement(
    "select",
    _extends({
      onChange: onChange,
      value: value,
      style: _extends({
        fontSize: size === "sm" ? "12px" : "14px",
        padding: "4px",
        background: bg || "rgba(0, 0, 0, 0.4)",
        borderColor: borderColor || "rgba(255, 255, 255, 0.2)",
        color: "white",
        width: "100%",
        marginTop: "4px"
      }, props.style)
    }, props),
    children
  );
};

exports.Select = Select;
var Slider = function Slider(_ref14) {
  var min = _ref14.min;
  var max = _ref14.max;
  var step = _ref14.step;
  var value = _ref14.value;
  var onChange = _ref14.onChange;
  var colorScheme = _ref14.colorScheme;
  var isDisabled = _ref14.isDisabled;

  var props = _objectWithoutProperties(_ref14, ["min", "max", "step", "value", "onChange", "colorScheme", "isDisabled"]);

  return _react2["default"].createElement("input", _extends({
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: onChange,
    disabled: isDisabled,
    style: _extends({
      width: "100%",
      WebkitAppearance: "none",
      appearance: "none",
      height: "6px",
      borderRadius: "3px",
      background: "rgba(255, 255, 255, 0.2)",
      outline: "none",
      opacity: isDisabled ? "0.5" : "0.8",
      transition: "opacity .2s"
    }, props.style)
  }, props));
};

exports.Slider = Slider;
var Divider = function Divider(_ref15) {
  var props = _objectWithoutProperties(_ref15, []);

  return _react2["default"].createElement("hr", _extends({ style: _extends({
      borderColor: "rgba(255, 255, 255, 0.2)",
      margin: "10px 0"
    }, props.style) }, props));
};

exports.Divider = Divider;
// Additional custom component for beat detection visualization
var BeatIndicator = function BeatIndicator(_ref16) {
  var active = _ref16.active;

  var props = _objectWithoutProperties(_ref16, ["active"]);

  return _react2["default"].createElement(
    Box,
    _extends({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      bg: active ? "rgba(66, 153, 225, 0.8)" : "rgba(255, 255, 255, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      style: _extends({
        transition: "all 0.1s",
        boxShadow: active ? "0 0 15px rgba(66, 153, 225, 0.8)" : "none"
      }, props.style)
    }, props),
    _react2["default"].createElement(Box, {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      bg: active ? "rgba(66, 153, 225, 1)" : "rgba(255, 255, 255, 0.1)",
      style: { boxShadow: active ? "0 0 10px rgba(66, 153, 225, 1)" : "none" }
    })
  );
};

exports.BeatIndicator = BeatIndicator;
// Simplified Range Slider component
var RangeSlider = function RangeSlider(_ref17) {
  var minValue = _ref17.minValue;
  var maxValue = _ref17.maxValue;
  var minLimit = _ref17.minLimit;
  var maxLimit = _ref17.maxLimit;
  var step = _ref17.step;
  var onMinChange = _ref17.onMinChange;
  var onMaxChange = _ref17.onMaxChange;

  var handleMinChange = function handleMinChange(e) {
    var newValue = Math.min(parseInt(e.target.value, 10), maxValue - step);
    onMinChange(newValue);
  };

  var handleMaxChange = function handleMaxChange(e) {
    var newValue = Math.max(parseInt(e.target.value, 10), minValue + step);
    onMaxChange(newValue);
  };

  return _react2["default"].createElement(
    Box,
    { position: "relative", height: "24px", width: "100%", mt: "8px" },
    _react2["default"].createElement(Box, {
      position: "absolute",
      width: "100%",
      height: "4px",
      bg: "rgba(255, 255, 255, 0.2)",
      borderRadius: "2px",
      top: "50%",
      style: { transform: "translateY(-50%)" }
    }),
    _react2["default"].createElement(Box, {
      position: "absolute",
      left: minValue / maxLimit * 100 + "%",
      width: (maxValue - minValue) / maxLimit * 100 + "%",
      height: "4px",
      bg: "rgba(66, 153, 225, 0.6)",
      borderRadius: "2px",
      top: "50%",
      style: { transform: "translateY(-50%)" }
    }),
    _react2["default"].createElement("input", {
      type: "range",
      min: minLimit,
      max: maxLimit,
      step: step,
      value: minValue,
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
    }),
    _react2["default"].createElement(Box, {
      position: "absolute",
      left: minValue / maxLimit * 100 + "%",
      top: "50%",
      width: "12px",
      height: "12px",
      bg: "white",
      borderRadius: "50%",
      style: { transform: "translate(-50%, -50%)", pointerEvents: "none" }
    }),
    _react2["default"].createElement("input", {
      type: "range",
      min: minLimit,
      max: maxLimit,
      step: step,
      value: maxValue,
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
    }),
    _react2["default"].createElement(Box, {
      position: "absolute",
      left: maxValue / maxLimit * 100 + "%",
      top: "50%",
      width: "12px",
      height: "12px",
      bg: "white",
      borderRadius: "50%",
      style: { transform: "translate(-50%, -50%)", pointerEvents: "none" }
    })
  );
};

exports.RangeSlider = RangeSlider;
// Export all components as a single object for compatibility with window.HeroUI
var HeroUI = {
  Box: Box,
  Card: Card,
  CardHeader: CardHeader,
  CardBody: CardBody,
  CardFooter: CardFooter,
  Badge: Badge,
  Button: Button,
  Flex: Flex,
  HStack: HStack,
  VStack: VStack,
  Text: Text,
  Switch: Switch,
  Select: Select,
  Slider: Slider,
  Divider: Divider,
  BeatIndicator: BeatIndicator,
  RangeSlider: RangeSlider
};

exports["default"] = HeroUI;
/* Slider track */ /* Selected range */ /* Min handle */ /* Min handle visible dot */ /* Max handle */ /* Max handle visible dot */
