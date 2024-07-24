export default function ButtonIcon({ src, handleClick }: { src: string, handleClick: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <>
        <button className="rounded-lg border-2 border-white hover:border-zinc-300 p-1" onClick={handleClick}><img src={src} alt="" width={25} height={25} /></button>
        </>
    );
}