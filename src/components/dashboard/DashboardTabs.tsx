
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuManager from './MenuManager';
import TranslationHistory from './TranslationHistory';
import UserCredits from './UserCredits';
import PlansTab from './PlansTab';

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('menus');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="menus">Seus Cardápios</TabsTrigger>
        <TabsTrigger value="translations">Traduções</TabsTrigger>
        <TabsTrigger value="credits">Créditos</TabsTrigger>
        <TabsTrigger value="plans">Planos</TabsTrigger>
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
      
      <TabsContent value="plans">
        <PlansTab />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
