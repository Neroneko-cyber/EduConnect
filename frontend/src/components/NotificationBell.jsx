import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const socket = new SockJS('http://localhost:8080/ws', null, {
      transports: ['websocket', 'xhr-streaming']
    });
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        // Subscribe to user-specific queue
        client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        });

        // Subscribe to global topic
        client.subscribe('/topic/public', (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user]);

  const handleToggle = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white">
            Notifikasi
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                    {n.event === 'NEW_DISPOSITION' ? 'Disposisi Baru' : 'Pembaruan'}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">
                    {n.payload?.title || 'Ada pembaruan data.'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
