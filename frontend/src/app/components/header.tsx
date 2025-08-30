"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { Share, Eye, Globe, LogOut, User, File } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import { useRouter } from "next/navigation";

interface HeaderProps {
  formTitle: string;
  onTitleChange: (title: string) => void;
  onShare: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  formStatus?: "draft" | "published" | "archived";
  showFormControls?: boolean;
  isFormDraft?: boolean;
  isFormPublished?: boolean;
  isPublishing?: boolean;
}

export function Header({
  formTitle,
  onTitleChange,
  onShare,
  onPreview,
  onPublish,
  showFormControls = true,
  isFormDraft = true,
  isFormPublished = false,
  isPublishing = false,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "U";

  if (!showFormControls) {
    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-inter font-bold text-foreground">
            Forms Dashboard
          </h2>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/files')}>
                <File className="mr-2 h-4 w-4" />
                <span>My Files</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Input
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg font-medium bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Form Title"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-transparent"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        
        {isFormDraft && onPublish && (
          <Button size="sm" className="gap-2" onClick={onPublish} disabled={isPublishing}>
            <Globe className="h-4 w-4" />
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        )}
        
        {isFormPublished && (
          <Button size="sm" className="gap-2" onClick={onShare}>
            <Share className="h-4 w-4" />
            Share
          </Button>
        )}
        

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/files')}>
              <File className="mr-2 h-4 w-4" />
              <span>My Files</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
