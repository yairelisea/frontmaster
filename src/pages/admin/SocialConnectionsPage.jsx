
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Share2, Facebook, Twitter, Instagram, Youtube, ExternalLink, Link2Off } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const usersSocialData = [
  { 
    userId: 'USR001', 
    userName: 'Alice Wonderland',
    avatar: '/placeholder-avatar-1.jpg',
    connections: [
      { platform: 'Facebook', handle: 'alice.w', status: 'Connected', icon: Facebook, color: 'text-blue-600' },
      { platform: 'Twitter', handle: '@aliceW', status: 'Connected', icon: Twitter, color: 'text-sky-500' },
      { platform: 'Instagram', handle: 'alice_wonder', status: 'Error', icon: Instagram, color: 'text-pink-500' },
    ]
  },
  { 
    userId: 'USR002', 
    userName: 'Bob The Builder',
    avatar: '/placeholder-avatar-2.jpg',
    connections: [
      { platform: 'Youtube', handle: 'BobBuilds', status: 'Connected', icon: Youtube, color: 'text-red-600' },
    ]
  },
  { 
    userId: 'USR004', 
    userName: 'Diana Prince',
    avatar: '/placeholder-avatar-3.jpg',
    connections: [
      { platform: 'Twitter', handle: '@WonderDiana', status: 'Connected', icon: Twitter, color: 'text-sky-500' },
      { platform: 'Instagram', handle: 'DianaP_Official', status: 'Connected', icon: Instagram, color: 'text-pink-500' },
    ]
  },
];

const SocialConnectionsPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Conexiones Sociales
        </motion.h1>
         <Share2 className="h-8 w-8 text-brand-green" />
      </div>
      <CardDescription>Visualiza y gestiona las conexiones de redes sociales de los usuarios.</CardDescription>

      <div className="space-y-8">
        {usersSocialData.map((user, userIndex) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: userIndex * 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <img  src={user.avatar} alt={user.userName} className="h-10 w-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1694388001616-1176f534d72f" />
                    <AvatarFallback>{user.userName.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-foreground">{user.userName}</CardTitle>
                    <CardDescription className="text-xs">{user.userId}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {user.connections.length > 0 ? (
                  <ul className="space-y-3">
                    {user.connections.map((conn, connIndex) => (
                      <li key={conn.platform} className="flex items-center justify-between p-3 bg-background border rounded-md hover:shadow-sm transition-shadow">
                        <div className="flex items-center">
                          <conn.icon className={`h-6 w-6 mr-3 ${conn.color}`} />
                          <div>
                            <p className="font-medium text-foreground">{conn.platform}</p>
                            <p className="text-sm text-muted-foreground">{conn.handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {conn.status}
                          </span>
                          {conn.status === 'Error' && 
                            <Button variant="outline" size="sm" className="text-xs border-yellow-500 text-yellow-600 hover:bg-yellow-50">Reconectar</Button>
                          }
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Link2Off className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Este usuario no tiene conexiones sociales.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SocialConnectionsPage;
  