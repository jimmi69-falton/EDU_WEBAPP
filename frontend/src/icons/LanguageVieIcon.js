import React from "react";

function LanguageVieIcon({ title, titleId, ...props }, svgRef) {
  return /*#__PURE__*/ React.createElement(
    "svg",
    Object.assign(
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 0,
        stroke: "currentColor",
        "aria-hidden": "true",
        ref: svgRef,
        "aria-labelledby": titleId,
      },
      props
    ),
    title ? /*#__PURE__*/ React.createElement("title", { id: titleId }, title) : null,
    /*#__PURE__*/ React.createElement(
      "text",
      {
        x: "50%",
        y: "55%",
        textAnchor: "middle",
        fontSize: "14",  // 🆙 chữ to hơn
        fill: "currentColor",
        alignmentBaseline: "middle",
      },
      "VI"
    )
  );
}

const ForwardRef = /*#__PURE__*/ React.forwardRef(LanguageVieIcon);
export default ForwardRef;
