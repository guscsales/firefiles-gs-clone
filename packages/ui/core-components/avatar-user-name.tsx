import { cn } from '../utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface AvatarUserNameProps extends React.ComponentProps<'div'> {
  profilePicture?: string;
  fullName: string;
  email?: string;
}

function _getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

function AvatarUserName({
  profilePicture,
  fullName,
  email,
  className,
  ...props
}: AvatarUserNameProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)} {...props}>
      <Avatar
        size="sm"
        className="size-9 rounded-[0.5rem] text-[0.8125rem] leading-4"
      >
        <AvatarImage src={profilePicture} alt={fullName} />
        <AvatarFallback>{_getInitials(fullName)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-px">
        <span className="font-medium text-foreground text-[0.8125rem] leading-4">
          {fullName}
        </span>
        {email && (
          <span className="text-muted-foreground text-[0.6875rem] leading-[0.875rem]">
            {email}
          </span>
        )}
      </div>
    </div>
  );
}

export { AvatarUserName };
