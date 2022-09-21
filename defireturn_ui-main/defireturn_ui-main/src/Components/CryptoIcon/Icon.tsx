import React from "react";
// import useDynamicSVGImport from "./useDynamicSVGImport";
import { IconProps } from "./types/interfaces";
import defIcon from "./../../assets/svg/question-mark.svg"
/**
 * Simple wrapper for dynamic SVG import hook. You can implement your own wrapper,
 * or even use the hook directly in your components.
 */
const Icon: React.FC<IconProps> = ({
  name,
  size,
  type,
  img,
  onCompleted,
  onError,
  ...rest
}): any => {
  if (!name || name === "")
    name = defIcon
  // const { error, loading, url } = useDynamicSVGImport(name?.toLowerCase()??"", type, {
  //     onCompleted,
  //     onError,
  // });
  // if (error) {
  //     return <p>{error.message}</p>;
  // }
  // if (loading) {
  //     return <p>Loading...</p>;
  // }
  // if (url) {
  // <img {...rest} src={url} style={{ height: size, width: size }}></img>
  return <img className={rest.className} src={name}
    onError={({ currentTarget }) => {
      currentTarget.onerror = null; // prevents looping
      //console.log(defIcon)
      currentTarget.src = defIcon;
    }} alt=""></img>;
  // }
  // return null;
};

export default Icon;
