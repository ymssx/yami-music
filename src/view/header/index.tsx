import { Link } from 'react-router-dom';
import Image from '@/components/image';
import './style.less';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/core/spotify/api';

export default () => {
  const [user, setUser] = useState<any>();
  useEffect(() => {
    getCurrentUser().then((res) => {
      setUser(res);
    });
  })
  return (
    <div className='shrink-0 flex items-center justify-between w-full bg-transparent header'>
      <div></div>
      <div className='flex'>
        
        {user && (
          <div className='flex gap-2'>
            <Link to='home'>
              <Image src={user.images[0].url} width={30} height={30} />
            </Link>
            {/* <span>{user.display_name}</span> */}
          </div>
        )}
      </div>
    </div>
  )
}