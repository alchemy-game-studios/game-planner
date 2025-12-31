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
import { Home, CreditCard, LogOut, Coins } from 'lucide-react';

export function UserMenu() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        onClick={login}
        className="bg-ck-ember hover:bg-ck-ember/90 text-white font-medium"
      >
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full bg-ck-ember hover:bg-ck-ember/80 flex items-center justify-center cursor-pointer transition-colors">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </button>
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
          <Link to="/" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account?tab=subscription" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
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
