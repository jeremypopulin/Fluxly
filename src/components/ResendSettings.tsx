import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Save, TestTube } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  defaultSubject: string;
}

export const ResendSettings: React.FC = () => {
  const [config, setConfig] = useState<ResendConfig>({
    apiKey: '',
    fromEmail: 'alerts@yourdomain.com',
    defaultSubject: 'New Job Notification'
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('resend_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error loading settings:', error.message);
        return;
      }

      if (data) {
        setConfig({
          apiKey: data.api_key || '',
          fromEmail: data.from_email || 'alerts@yourdomain.com',
          defaultSubject: data.default_subject || 'New Job Notification'
        });
      }
    } catch (error) {
      console.error('❌ Unexpected load error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('resend_settings')
        .upsert(
          {
            id: 1, // ✅ Required for onConflict to work
            api_key: config.apiKey,
            from_email: config.fromEmail,
            default_subject: config.defaultSubject
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      toast({
        title: '✅ Settings Saved',
        description: 'Resend configuration saved successfully.'
      });
    } catch (error: any) {
      console.error('❌ Failed to save Resend settings:', error.message || error);
      toast({
        title: '❌ Save Failed',
        description: error.message || 'Unexpected error while saving.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-job-notification', {
        body: {
          to: config.fromEmail,
          subject: 'Test Email from Resend',
          html: '<p>This is a test email to verify your Resend configuration.</p>'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Test Successful',
        description: 'Test email sent successfully via Resend!'
      });
    } catch (error: any) {
      console.error('❌ Resend test failed:', error.message || error);
      toast({
        title: '❌ Test Failed',
        description: error.message || 'Failed to send test email via Resend.',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (key: keyof ResendConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Resend Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Resend API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="re_xxxxxxxxxx"
                  value={config.apiKey}
                  onChange={(e) => updateConfig('apiKey', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  placeholder="alerts@yourdomain.com"
                  value={config.fromEmail}
                  onChange={(e) => updateConfig('fromEmail', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultSubject">Default Subject</Label>
                <Input
                  id="defaultSubject"
                  placeholder="New Job Notification"
                  value={config.defaultSubject}
                  onChange={(e) => updateConfig('defaultSubject', e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>

                <Button variant="outline" onClick={handleTest} disabled={testing || !config.apiKey}>
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing ? 'Testing...' : 'Test Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResendSettings;
