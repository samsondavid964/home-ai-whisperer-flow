import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
}

export const SettingsModal = ({ webhookUrl, onWebhookUrlChange }: SettingsModalProps) => {
  const [tempUrl, setTempUrl] = useState(webhookUrl);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onWebhookUrlChange(tempUrl);
    setIsOpen(false);
    toast({
      title: "Settings saved",
      description: "Your AI agent settings have been updated successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 right-4 z-10">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI agent and customize the application appearance.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ai-agent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-agent">AI Agent</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-agent" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="webhook-url">N8N Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="col-span-3"
                />
                <p className="text-sm text-gray-500">
                  This should be the webhook URL from your n8n workflow trigger.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select disabled>
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Default Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Model</SelectItem>
                    <SelectItem value="gpt-4">GPT-4 (Coming Soon)</SelectItem>
                    <SelectItem value="claude">Claude (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Model selection will be available in a future update.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Application Theme</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Theme Mode</p>
                    <p className="text-sm text-gray-500">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Save className="w-4 h-4 mr-2" />
            Save AI Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
