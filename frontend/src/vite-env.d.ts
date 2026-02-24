/// <reference types="vite/client" />

// Fix react-icons type compatibility with React 18
import type { SVGAttributes } from "react";

declare module "react-icons/hi2" {
  import { IconType } from "react-icons";
  export const HiOutlineHome: IconType;
  export const HiOutlineCube: IconType;
  export const HiOutlineBeaker: IconType;
  export const HiOutlineBolt: IconType;
  export const HiOutlineCog6Tooth: IconType;
  export const HiOutlineBars3: IconType;
  export const HiOutlineArrowRightOnRectangle: IconType;
  export const HiOutlinePlus: IconType;
  export const HiOutlinePencil: IconType;
  export const HiOutlineTrash: IconType;
  export const HiOutlineEye: IconType;
  export const HiOutlineMagnifyingGlass: IconType;
  export const HiOutlineArrowLeft: IconType;
  export const HiOutlineCheckCircle: IconType;
  export const HiOutlineServerStack: IconType;
  export const HiOutlineShieldCheck: IconType;
  export const HiOutlineCurrencyDollar: IconType;
}

declare module "react-icons" {
  import { ComponentType, SVGAttributes } from "react";
  export type IconType = ComponentType<
    SVGAttributes<SVGElement> & { className?: string; size?: string | number }
  >;
}
