import { LoaderCircle } from "lucide-react";
import { useState, type ReactElement } from "react";

export default ({ children, className, onClick }: {
  children: ReactElement | string;
  className?: string;
  onClick?: () => any;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <button className={className} onClick={() => {
      const res = onClick?.();
      if (res instanceof Promise) {
        setLoading(true);
        res.finally(() => {
          setLoading(false);
        });
      }
    }}>
      {loading ? <LoaderCircle size={16} className='animate-spin' /> : children}
    </button>
  )
}