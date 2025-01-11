// hover icon prop, yeah i know the prop names are odd

interface Props {
  value: string;
  iconClass: string;
  iconName: React.ElementType;
}

function TempIcon({ value, iconClass, iconName: Icon }: Props) {
  return (
    <div className="group relative w-max">
      <Icon className={iconClass} />
      <div className="absolute bottom-full mb-2 w-max translate-x-7 rounded bg-orange-400 px-2 py-1 text-sm text-white opacity-0 shadow-lg transition-opacity duration-[300ms] group-hover:opacity-100 invisible group-hover:visible">
        {value}
      </div>
    </div>
  );
}

export default TempIcon;
