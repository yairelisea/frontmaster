import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'; // Corrected import path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Youtube, Globe, MessageSquare, ThumbsUp, ThumbsDown, MinusSquare, Filter, Search, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const socialPlatforms = [
  { name: 'Todos', icon: MessageSquare, color: 'text-brand-green' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { name: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { name: 'Internet', icon: Globe, color: 'text-purple-500' },
];

const mockPosts = [
  { id: 'P001', platform: 'X (Twitter)', user: '@usuarioX', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', content: 'Gran anuncio de #BLACKBOXMONITOR, ¡qué emoción!', date: '2025-05-22 10:00', sentiment: 'Positivo', likes: 150, comments: 20 },
  { id: 'P002', platform: 'Facebook', user: 'Noticias Tech', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', content: 'BLACKBOX MONITOR revoluciona el análisis de medios. Su nueva función de Resumen IA es impresionante.', date: '2025-05-22 09:30', sentiment: 'Positivo', likes: 250, comments: 45 },
  { id: 'P003', platform: 'Instagram', user: 'influencer_digital', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', content: 'Probando BLACKBOX MONITOR para mi última campaña. Los resultados son muy detallados. #marketing #IA', date: '2025-05-21 15:00', sentiment: 'Neutral', likes: 500, comments: 60 },
  { id: 'P004', platform: 'YouTube', user: 'CanalDeAnalisis', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', content: 'Video reseña: ¿Vale la pena BLACKBOX MONITOR? Mi opinión honesta.', date: '2025-05-21 12:00', sentiment: 'Neutral', likes: 1200, comments: 150 },
  { id: 'P005', platform: 'Internet', user: 'BlogDeNoticias.com', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', content: 'Artículo: La inteligencia artificial de BLACKBOX MONITOR y su impacto en la toma de decisiones.', date: '2025-05-20 18:00', sentiment: 'Positivo', likes: 0, comments: 5 },
  { id: 'P006', platform: 'X (Twitter)', user: '@critico_tech', avatar: 'https://randomuser.me/api/portraits/women/6.jpg', content: 'No estoy seguro sobre la precisión del Resumen IA de BLACKBOX. Necesita mejorar. #feedback', date: '2025-05-22 11:00', sentiment: 'Negativo', likes: 10, comments: 5 },
];

const PostCard = ({ post }) => {
  const PlatformIcon = socialPlatforms.find(p => p.name === post.platform)?.icon || Globe;
  const platformColor = socialPlatforms.find(p => p.name === post.platform)?.color || 'text-gray-500';
  
  let sentimentIcon, sentimentColor;
  switch (post.sentiment) {
    case 'Positivo': sentimentIcon = <ThumbsUp className="h-4 w-4" />; sentimentColor = 'text-green-500'; break;
    case 'Negativo': sentimentIcon = <ThumbsDown className="h-4 w-4" />; sentimentColor = 'text-red-500'; break;
    default: sentimentIcon = <MinusSquare className="h-4 w-4" />; sentimentColor = 'text-yellow-500'; break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback>{post.user.substring(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">{post.user}</CardTitle>
                <CardDescription className="text-xs">{post.date}</CardDescription>
              </div>
            </div>
            <PlatformIcon className={`h-6 w-6 ${platformColor}`} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{post.content}</p>
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center ${sentimentColor}`}>
              {sentimentIcon}
              <span className="ml-1">{post.sentiment}</span>
            </div>
            { (post.likes > 0 || post.comments > 0) &&
              <div className="flex items-center space-x-3">
                {post.likes > 0 && <span>{post.likes} Likes</span>}
                {post.comments > 0 && <span>{post.comments} Comentarios</span>}
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const UserPostsMentionsPage = () => {
  const [activeTab, setActiveTab] = useState(socialPlatforms[0].name);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('todos');
  const [sortBy, setSortBy] = useState('date_desc');

  const filteredAndSortedPosts = mockPosts
    .filter(post => 
      (activeTab === 'Todos' || post.platform === activeTab) &&
      (post.content.toLowerCase().includes(searchTerm.toLowerCase()) || post.user.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterSentiment === 'todos' || post.sentiment.toLowerCase() === filterSentiment)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return new Date(a.date) - new Date(b.date);
        case 'likes_desc': return b.likes - a.likes;
        case 'sentiment_pos': return (b.sentiment === 'Positivo' ? 1 : -1) - (a.sentiment === 'Positivo' ? 1 : -1); //簡易ソート
        default: return new Date(b.date) - new Date(a.date); // date_desc
      }
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="shadow-xl border-t-4 border-brand-green">
        <CardHeader className="bg-gray-50 p-4 md:p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Posts y Menciones</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Explora las menciones sobre tu objetivo a través de diferentes canales.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b sticky top-[65px] lg:top-[70px] bg-card z-10 px-2 md:px-4">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 h-auto p-1.5">
                {socialPlatforms.map(platform => (
                  <TabsTrigger key={platform.name} value={platform.name} className="flex-col sm:flex-row items-center justify-center gap-1 py-2 text-xs sm:text-sm data-[state=active]:bg-brand-green data-[state=active]:text-white data-[state=active]:shadow-md">
                    <platform.icon className={`h-4 w-4 sm:mr-1.5 ${activeTab === platform.name ? 'text-white' : platform.color}`} />
                    {platform.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar en menciones..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus-visible:ring-brand-green"
                  />
                </div>
                <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                  <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                    <SelectTrigger className="w-full md:w-[150px] focus-visible:ring-brand-green">
                      <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sentimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todo Sentimiento</SelectItem>
                      <SelectItem value="positivo">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negativo">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px] focus-visible:ring-brand-green">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Más Recientes</SelectItem>
                      <SelectItem value="date_asc">Más Antiguos</SelectItem>
                      <SelectItem value="likes_desc">Más Likes</SelectItem>
                      <SelectItem value="sentiment_pos">Priorizar Positivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {socialPlatforms.map(platform => (
                <TabsContent key={platform.name} value={platform.name}>
                  {filteredAndSortedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedPosts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold text-foreground">No hay menciones para mostrar.</p>
                      <p className="text-sm text-muted-foreground">Intenta ajustar tus filtros o revisa más tarde.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserPostsMentionsPage;