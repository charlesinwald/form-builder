import { cn } from "@/lib/utils";
import { useState } from "react";

export const Loader = () => {
  const [count, setCount] = useState(0);

  return ( 
<div className="loader">
  <div className="box box-1">
    <div className="side-front"></div>
    <div className="side-back"></div>
    <div className="side-left"></div>
    <div className="side-right"></div>
    <div className="side-top"></div>
    <div className="side-bottom"></div>
  </div>
  <div className="box box-2">
    <div className="side-front"></div>
    <div className="side-back"></div>
    <div className="side-left"></div>
    <div className="side-right"></div>
    <div className="side-top"></div>
    <div className="side-bottom"></div>
  </div>
  <div className="box box-3">
    <div className="side-front"></div>
    <div className="side-back"></div>
    <div className="side-left"></div>
    <div className="side-right"></div>
    <div className="side-top"></div>
    <div className="side-bottom"></div>
  </div>
  <div className="box box-4">
    <div className="side-front"></div>
    <div className="side-back"></div>
    <div className="side-left"></div>
    <div className="side-right"></div>
    <div className="side-top"></div>
    <div className="side-bottom"></div>
  </div>
</div>
  );
};
