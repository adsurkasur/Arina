import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit, 
  User, 
  Shield, 
  KeyRound, 
  Mail, 
  Save, 
  X,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save profile data logic would go here
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">User Profile</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <X className="h-4 w-4 mr-2" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
              <CardDescription>
                Update your personal information and how others see you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={user?.photoURL} alt={user?.name} />
                  <AvatarFallback className="text-xl bg-primary text-white">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1 flex-1">
                  <h3 className="text-2xl font-medium">{user?.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Standard Account
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Your name" 
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={true} // Email should typically not be editable here
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              {isEditing && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto mr-2"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
              <Button 
                variant={isEditing ? "default" : "outline"} 
                className="w-full sm:w-auto flex items-center"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center p-2 border rounded-md bg-gray-50">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Standard Account</p>
                    <p className="text-sm text-gray-500">Basic features for agricultural business analysis</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sign out from all devices</Label>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out from all devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full sm:w-auto mr-2">
                Cancel
              </Button>
              <Button className="w-full sm:w-auto">
                <KeyRound className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}