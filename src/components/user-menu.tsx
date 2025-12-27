import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, CreditCard, LogOut, Coins } from 'lucide-react';

export function UserMenu() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={login}>
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user.displayName}</p>
            <p className="text-xs leading-none text-gray-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account?tab=subscription" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription
            <span className="ml-auto text-xs text-gray-500 capitalize">{user.subscriptionTier}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account?tab=credits" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <Coins className="mr-2 h-4 w-4" />
            Credits
            <span className="ml-auto text-xs text-gray-500">{user.credits}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center cursor-pointer text-gray-300 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
