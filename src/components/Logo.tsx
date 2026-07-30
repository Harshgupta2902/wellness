import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Manovyatha"
        width={size}
        height={size}
        className="object-contain"
      />
      {showText && (
        <span className="text-xl font-bold text-[#022932]">Manovyatha</span>
      )}
    </div>
  );
}
