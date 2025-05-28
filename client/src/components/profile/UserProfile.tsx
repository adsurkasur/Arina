import React, { useState } from "react";
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
import { useChat } from "@/hooks/useChat";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';

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

  const { conversations, deleteConversation, loadChatHistory } = useChat();
  const { analysisResults, deleteAnalysis, refetch: refetchAnalysis } = useAnalysisHistory();
  const { recommendations, deleteRecommendationSet, fetchRecommendations } = useRecommendations();

  const [confirmChats, setConfirmChats] = useState(false);
  const [confirmAnalysis, setConfirmAnalysis] = useState(false);
  const [confirmRecommendations, setConfirmRecommendations] = useState(false);

  // Use the shared translation hook
  const { t, i18n } = useTranslation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save profile data logic would go here
    setIsEditing(false);
    toast({
      title: t('userProfile.updated'),
      description: t('userProfile.updatedDesc'),
    });
  };

  // Clear all chat history
  const handleClearAllChats = async () => {
    if (conversations.length === 0) return;
    for (const conv of conversations) {
      await deleteConversation(conv.id);
    }
    await loadChatHistory();
  };

  // Clear all analysis history
  const handleClearAllAnalysis = async () => {
    if (analysisResults.length === 0) return;
    for (const result of analysisResults) {
      await deleteAnalysis(result.id);
    }
    await refetchAnalysis();
  };

  // Clear all recommendations
  const handleClearAllRecommendations = async () => {
    if (recommendations.length === 0) return;
    for (const rec of recommendations) {
      await deleteRecommendationSet(rec.id);
    }
    await fetchRecommendations();
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">{t('userProfile.title')}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">{t('userProfile.profile')}</TabsTrigger>
          <TabsTrigger value="account">{t('userProfile.account')}</TabsTrigger>
          <TabsTrigger value="security">{t('userProfile.security')}</TabsTrigger>
          <TabsTrigger value="memory">{t('userProfile.memory')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>{t('userProfile.personalInfo')}</CardTitle>
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
                  {isEditing ? t('userProfile.cancel') : t('userProfile.edit')}
                </Button>
              </div>
              <CardDescription>
                {t('userProfile.personalInfoDesc')}
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
                    {t("Standard Account", "Akun Standar")}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('userProfile.displayName')}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder={t('userProfile.displayNamePlaceholder')} 
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
                    placeholder={t('userProfile.emailPlaceholder')} 
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={true}
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
                  {t('userProfile.cancel')}
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
                    {t('userProfile.save')}
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('userProfile.edit')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('userProfile.accountSettings')}</CardTitle>
              <CardDescription>
                {t('userProfile.accountSettingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('userProfile.accountType')}</Label>
                <div className="flex items-center p-2 border rounded-md bg-gray-50">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">{t('userProfile.standardAccount')}</p>
                    <p className="text-sm text-gray-500">{t('userProfile.standardAccountDesc')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('userProfile.signOutAll')}</Label>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('userProfile.signOut')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('userProfile.securitySettings')}</CardTitle>
              <CardDescription>
                {t('userProfile.securitySettingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t('userProfile.currentPassword')}</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('userProfile.newPassword')}</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('userProfile.confirmNewPassword')}</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full sm:w-auto mr-2">
                {t("Cancel", "Batal")}
              </Button>
              <Button className="w-full sm:w-auto">
                <KeyRound className="h-4 w-4 mr-2" />
                {t('userProfile.updatePassword')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('userProfile.memory')}</CardTitle>
              <CardDescription>
                {t('userProfile.memoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chat History */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{t('userProfile.chatHistory')}</h4>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmChats(true)}>{t('userProfile.clearAll')}</Button>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {conversations.length === 0 ? (
                    <li className="text-gray-400">{t('userProfile.noChatHistory')}</li>
                  ) : (
                    conversations.map((conv: any) => (
                      <li key={conv.id}>{conv.title}</li>
                    ))
                  )}
                </ul>
                <Dialog open={confirmChats} onOpenChange={setConfirmChats}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('userProfile.deleteAllChatHistory')}</DialogTitle>
                      <DialogDescription>{t('userProfile.deleteAllChatHistoryDesc')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmChats(false)}>{t('userProfile.cancel')}</Button>
                      <Button variant="destructive" onClick={async () => { await handleClearAllChats(); setConfirmChats(false); }}>{t('userProfile.deleteAll')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Analysis History */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{t('userProfile.analysisHistory')}</h4>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmAnalysis(true)}>{t('userProfile.clearAll')}</Button>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {analysisResults.length === 0 ? (
                    <li className="text-gray-400">{t('userProfile.noAnalysisHistory')}</li>
                  ) : (
                    analysisResults.map((result) => (
                      <li key={result.id}>{result.type}</li>
                    ))
                  )}
                </ul>
                <Dialog open={confirmAnalysis} onOpenChange={setConfirmAnalysis}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('userProfile.deleteAllAnalysisHistory')}</DialogTitle>
                      <DialogDescription>{t('userProfile.deleteAllAnalysisHistoryDesc')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmAnalysis(false)}>{t('userProfile.cancel')}</Button>
                      <Button variant="destructive" onClick={async () => { await handleClearAllAnalysis(); setConfirmAnalysis(false); }}>{t('userProfile.deleteAll')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Recommendations History */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{t('userProfile.recommendationsHistory')}</h4>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmRecommendations(true)}>{t('userProfile.clearAll')}</Button>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {recommendations.length === 0 ? (
                    <li className="text-gray-400">{t('userProfile.noRecommendationsHistory')}</li>
                  ) : (
                    recommendations.map((rec: any) => (
                      <li key={rec.id}>{rec.summary || rec.id}</li>
                    ))
                  )}
                </ul>
                <Dialog open={confirmRecommendations} onOpenChange={setConfirmRecommendations}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('userProfile.deleteAllRecommendations')}</DialogTitle>
                      <DialogDescription>{t('userProfile.deleteAllRecommendationsDesc')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmRecommendations(false)}>{t('userProfile.cancel')}</Button>
                      <Button variant="destructive" onClick={async () => { await handleClearAllRecommendations(); setConfirmRecommendations(false); }}>{t('userProfile.deleteAll')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}