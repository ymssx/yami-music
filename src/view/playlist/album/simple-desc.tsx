export default (props: {
  className?: string;
  name: string;
  desc: string;
  playlists: { name: string }[];
}) => {
  return (
    <div className={`${props.className} mb-8 fadeup slower flex flex-col`}>
      <h1>{props.name}</h1>
      <p className='mt-2 text-sm'>{props.desc}</p>
      <p className='mt-2 text-sm'>{props.playlists?.map(item => `${item.name}`).join(', ')}</p>
    </div>
  );
}