
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuManager from './MenuManager';
import TranslationHistory from './TranslationHistory';
import UserCredits from './UserCredits';

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('menus');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="menus">Seus Cardápios</TabsTrigger>
        <TabsTrigger value="translations">Traduções</TabsTrigger>
        <TabsTrigger value="credits">Créditos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="menus">
        <MenuManager />
      </TabsContent>
      
      <TabsContent value="translations">
        <TranslationHistory />
      </TabsContent>
      
      <TabsContent value="credits">
        <UserCredits />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
