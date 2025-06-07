import { useState } from "react";

export default (props: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) => {
  const [sucess, setSucess] = useState(false);

  return (
    <div className={`${props.className} rounded overflow-hidden`} style={{ width: props.width, height: props.height, background: 'rgba(0,0,0,0.1)' }}>
      <img
        src={props.src}
        className="transition-all duration-300 ease-in-out"
        alt=""
        style={{ width: props.width, height: props.height, objectFit: 'cover', opacity: sucess ? 1 : 0 }}
        onLoad={() => setSucess(true)}
      />
    </div>
  );
};