'use client';

import { useState, useEffect } from 'react';
import { useTeacherTranslations } from '@/lib/translation/use-translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Languages, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings,
  Eye,
  Users,
  Sparkles
} from 'lucide-react';

interface TranslationManagerProps {
  teacherId: string;
  courses?: any[];
  classes?: any[];
}

export function TranslationManager({ 
  teacherId, 
  courses = [], 
  classes = [] 
}: TranslationManagerProps) {
  const { settings, stats, loading, updateSettings, bulkTranslate } = useTeacherTranslations(teacherId);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [translating, setTranslating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleBulkTranslate = async () => {
    if (selectedContent.length === 0) return;
    
    setTranslating(true);
    try {
      const results = await bulkTranslate(
        selectedContent,
        'course', // or dynamic based on selection
        settings?.target_languages || ['en', 'es', 'ru']
      );
      
      // Show results
      const successful = results.filter(r => r.success).length;
      alert(`Translated ${successful} of ${results.length} items`);
      
      setSelectedContent([]);
    } catch (error) {
      console.error('Bulk translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses & Classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translated</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.translatedContent || 0}</div>
            <Progress value={stats?.translationCoverage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              From students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${settings?.current_month_spent?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              of ${settings?.monthly_translation_budget || '∞'} budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Language Coverage */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Language Coverage</h3>
                {['en', 'es', 'ru'].map(locale => (
                  <div key={locale} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{locale.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {locale === 'en' ? 'English' : locale === 'es' ? 'Spanish' : 'Russian'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">85%</span>
                        <span className="text-muted-foreground"> translated</span>
                      </div>
                      <Progress value={85} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="pt-4 space-y-2">
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setSelectedTab('content')}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Translate All Untranslated Content
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setSelectedTab('requests')}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Review Translation Requests
                  </span>
                  <Badge variant="secondary">{stats?.pendingRequests || 0}</Badge>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {/* Content List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Your Content</h3>
                  <Button 
                    size="sm"
                    disabled={selectedContent.length === 0 || translating}
                    onClick={handleBulkTranslate}
                  >
                    {translating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="mr-2 h-4 w-4" />
                        Translate Selected ({selectedContent.length})
                      </>
                    )}
                  </Button>
                </div>

                {/* Course List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Courses</h4>
                  {courses.map(course => (
                    <div 
                      key={course.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContent([...selectedContent, course.id]);
                            } else {
                              setSelectedContent(selectedContent.filter(id => id !== course.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {course.translated_locales?.map((locale: string) => (
                              <Badge key={locale} variant="secondary" className="text-xs">
                                {locale}
                              </Badge>
                            )) || <span className="text-xs text-muted-foreground">Not translated</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{course.view_count || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Class List */}
                <div className="space-y-2 pt-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Classes</h4>
                  {classes.map(cls => (
                    <div 
                      key={cls.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContent([...selectedContent, cls.id]);
                            } else {
                              setSelectedContent(selectedContent.filter(id => id !== cls.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{cls.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {cls.translated_locales?.map((locale: string) => (
                              <Badge key={locale} variant="secondary" className="text-xs">
                                {locale}
                              </Badge>
                            )) || <span className="text-xs text-muted-foreground">Not translated</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{cls.duration_min} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {/* Translation Requests */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-3">Student Requests</h3>
                {stats?.pendingRequests > 0 ? (
                  <div className="space-y-2">
                    {/* Sample request items */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">Advanced Vinyasa Flow</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested in Spanish by 5 students
                          </p>
                        </div>
                        <Button size="sm" variant="default">
                          Translate Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pending translation requests
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {/* Translation Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Auto-Translation Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-translate Courses</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically translate new courses to target languages
                      </p>
                    </div>
                    <Switch
                      checked={settings?.auto_translate_courses ?? true}
                      onCheckedChange={(checked) => 
                        updateSettings({ auto_translate_courses: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-translate Classes</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically translate new classes to target languages
                      </p>
                    </div>
                    <Switch
                      checked={settings?.auto_translate_classes ?? true}
                      onCheckedChange={(checked) => 
                        updateSettings({ auto_translate_classes: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Require Review</p>
                      <p className="text-xs text-muted-foreground">
                        Review translations before publishing
                      </p>
                    </div>
                    <Switch
                      checked={settings?.require_review_before_publish ?? false}
                      onCheckedChange={(checked) => 
                        updateSettings({ require_review_before_publish: checked })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-3">Target Languages</h3>
                  <div className="flex gap-2">
                    {['en', 'es', 'ru', 'de', 'fr', 'pt'].map(lang => (
                      <Badge
                        key={lang}
                        variant={settings?.target_languages?.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = settings?.target_languages || [];
                          const updated = current.includes(lang)
                            ? current.filter((l: string) => l !== lang)
                            : [...current, lang];
                          updateSettings({ target_languages: updated });
                        }}
                      >
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-3">Monthly Budget</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings?.monthly_translation_budget || ''}
                      onChange={(e) => 
                        updateSettings({ 
                          monthly_translation_budget: parseFloat(e.target.value) || null 
                        })
                      }
                      placeholder="Unlimited"
                      className="w-32 px-3 py-1 text-sm border rounded"
                    />
                    <span className="text-sm text-muted-foreground">USD per month</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}