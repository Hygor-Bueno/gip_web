import React from "react";
import './Style.css';

const Image = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img {...props} />;
};

export default Image;
