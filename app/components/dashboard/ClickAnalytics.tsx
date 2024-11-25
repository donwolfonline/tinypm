import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, BarChart2 } from 'lucide-react';
import type { Content, LinkContent } from '@/types';

type AnalyticsProps = {
  content: Content[];
  theme: string;
};

// Type guard to check if content is a LinkContent
function isLinkContent(content: Content): content is LinkContent {
  return content.type === 'LINK';
}

const getAchievements = (clicks: number) => {
  const achievements = [];
  if (clicks >= 1) achievements.push({ name: 'First Click', icon: '🎯' });
  if (clicks >= 5) achievements.push({ name: 'Getting Popular', icon: '⭐' });
  if (clicks >= 10) achievements.push({ name: 'Rising Star', icon: '🌟' });
  if (clicks >= 25) achievements.push({ name: 'Traffic Master', icon: '🚀' });
  if (clicks >= 50) achievements.push({ name: 'Link Legend', icon: '👑' });
  if (clicks >= 100) achievements.push({ name: 'Viral Sensation', icon: '🌐' });
  return achievements;
};

const getBadgeColor = (clicks: number) => {
  if (clicks >= 100) return 'bg-purple-100 text-purple-800 border-purple-300';
  if (clicks >= 50) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
  if (clicks >= 25) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (clicks >= 10) return 'bg-green-100 text-green-800 border-green-300';
  if (clicks >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
};

export default function ClickAnalytics({ content, theme }: AnalyticsProps) {
  const [view, setView] = useState<'chart' | 'achievements'>('chart');
  
  // Filter for links and handle undefined clicks
  const links = content
    .filter(isLinkContent)
    .map(link => ({
      ...link,
      clicks: link.clicks || 0  // Convert undefined to 0
    }))
    .filter(link => link.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks);

  // Calculate total clicks
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  
  // Prepare data for chart
  const chartData = links.map(link => ({
    name: link.title || link.url?.split('/').pop() || 'Untitled',
    clicks: link.clicks || 0
  }));

  return (
    <div className="rounded-xl border-2 border-black bg-white p-6 shadow-lg space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('chart')}
            className={`p-2 rounded-lg transition-colors ${
              view === 'chart' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            <BarChart2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView('achievements')}
            className={`p-2 rounded-lg transition-colors ${
              view === 'achievements' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Award className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="p-3 bg-black text-white rounded-full">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm text-gray-600">Total Clicks</h3>
          <p className="text-2xl font-bold">{totalClicks}</p>
        </div>
      </div>

      {view === 'chart' ? (
        <>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill={theme === 'YELLOW' ? '#FFCC00' : '#000000'} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-6">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 text-sm rounded border ${getBadgeColor(link.clicks || 0)}`}>
                    {link.clicks} clicks
                  </div>
                  <span className="font-medium truncate">
                    {link.title || link.url?.split('/').pop() || 'Untitled'}
                  </span>
                </div>
                {getAchievements(link.clicks || 0).slice(-1)[0]?.icon}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {links.map((link) => {
            const achievements = getAchievements(link.clicks || 0);
            return (
              <div key={link.id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2 truncate">
                  {link.title || link.url?.split('/').pop() || 'Untitled'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-white rounded border text-sm"
                    >
                      <span>{achievement.icon}</span>
                      <span>{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}