import moment from 'moment';
import DOMPurify from 'dompurify';
import './style.less';
import { Flame, Timer } from 'lucide-react';
import Button from '@/components/button';
export default function GameDetail(props: { id: string; className?: string } & any) {
  const { className } = props;
  const data = props;

  return (
    <div className={`${className} playlist`}>
      <div className='shrink-0 playlist-info'>
        {data?.name && <div className='mb-4 fadeappear slower '>
          <h1 className=''>{data.name}</h1>
          {data.description && <p className='mt-3 whitespace-pre-line' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description || '') }}></p>}

          <div className='mt-3 flex gap-3 flex-wrap'>
            {data?.playtime_forever && <p className='flex items-center gap-[3px]'>
              <Timer size={16} />游玩时长{ Math.round(data?.playtime_forever / 60) }小时
            </p>}
            <p className='flex items-center gap-[3px]'><Flame size={16} />{moment.unix(data?.rtime_last_played || 0).fromNow()}</p>
          </div>

          <section className="mt-6 flex gap-3">
            <Button className="highlight flex items-center gap-2" onClick={async () => {
            }}>PLAY</Button>
          </section>
        </div>}
      </div>
    </div>
  )
}
