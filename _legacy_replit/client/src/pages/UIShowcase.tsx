import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mic, Music, Play, Pause, Volume2, Settings } from "lucide-react";

export default function UIShowcase() {
  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">UI Design System</h1>
        <p className="text-muted-foreground">Premium glassmorphism component library</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Buttons & Interactives */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Buttons & Actions</h2>
          <GlassCard className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button>Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="icon" className="rounded-full"><Play className="w-4 h-4" /></Button>
              <Button size="icon" variant="secondary" className="rounded-full"><Pause className="w-4 h-4" /></Button>
              <Button size="icon" variant="outline" className="rounded-full"><Settings className="w-4 h-4" /></Button>
            </div>
          </GlassCard>
        </section>

        {/* Form Elements */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Form Controls</h2>
          <GlassCard className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400">Input Field</label>
              <Input placeholder="Enter your email..." className="bg-zinc-900/50 border-zinc-800" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Toggle Setting</span>
              <Switch />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-400">Volume Level</label>
                <Volume2 className="w-4 h-4 text-zinc-400" />
              </div>
              <Slider defaultValue={[75]} max={100} step={1} />
            </div>
          </GlassCard>
        </section>

        {/* Cards & Badges */}
        <section className="space-y-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-white">Cards & Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard gradient>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gradient Card</h3>
              <p className="text-sm text-zinc-400">Cards support subtle gradients to add depth and guide user attention.</p>
            </GlassCard>
            
            <GlassCard>
              <div className="flex gap-2 mb-4">
                <Badge variant="default" className="bg-primary hover:bg-primary/80">Active</Badge>
                <Badge variant="secondary">Pending</Badge>
                <Badge variant="outline" className="text-red-400 border-red-400/30">Error</Badge>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Status Badges</h3>
              <p className="text-sm text-zinc-400">Use badges to indicate status, categories, or tags.</p>
            </GlassCard>

            <GlassCard className="flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-4 relative">
                <Music className="w-8 h-8 text-white" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
              </div>
              <h3 className="font-bold text-white">Profile Card</h3>
              <p className="text-xs text-zinc-500 mt-1">Center aligned content</p>
            </GlassCard>
          </div>
        </section>

        {/* Tabs Interface */}
        <section className="space-y-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-white">Tabbed Interface</h2>
          <GlassCard>
            <Tabs defaultValue="music" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50">
                <TabsTrigger value="music">Music</TabsTrigger>
                <TabsTrigger value="podcast">Podcast</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              <TabsContent value="music" className="p-4 bg-zinc-900/30 rounded-xl mt-4 border border-white/5">
                <h4 className="font-bold text-white mb-2">Music Production</h4>
                <p className="text-sm text-zinc-400">State of the art recording equipment and sound isolation.</p>
              </TabsContent>
              <TabsContent value="podcast" className="p-4 bg-zinc-900/30 rounded-xl mt-4 border border-white/5">
                <h4 className="font-bold text-white mb-2">Podcast Studio</h4>
                <p className="text-sm text-zinc-400">Four microphone setup with video recording capabilities.</p>
              </TabsContent>
              <TabsContent value="video" className="p-4 bg-zinc-900/30 rounded-xl mt-4 border border-white/5">
                <h4 className="font-bold text-white mb-2">Video Suite</h4>
                <p className="text-sm text-zinc-400">Green screen, professional lighting, and 4K cameras.</p>
              </TabsContent>
            </Tabs>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
