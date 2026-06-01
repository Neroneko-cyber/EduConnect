import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useSSE = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Establish SSE connection
        const eventSource = new EventSource(`http://localhost:8080/api/notifications/stream/${user.id}`);

        eventSource.addEventListener('NEW_DISPOSITION', (event) => {
            const data = JSON.parse(event.data);
            setNotifications(prev => [{ type: 'DISPOSITION', data, read: false }, ...prev]);
        });

        eventSource.addEventListener('NEW_ANNOUNCEMENT', (event) => {
            const data = JSON.parse(event.data);
            setNotifications(prev => [{ type: 'ANNOUNCEMENT', data, read: false }, ...prev]);
        });

        eventSource.addEventListener('DISPOSITION_UPDATED', (event) => {
            const data = JSON.parse(event.data);
            setNotifications(prev => [{ type: 'DISPOSITION_UPDATE', data, read: false }, ...prev]);
        });

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close(); // Close on error, maybe implement reconnect logic
        };

        return () => {
            eventSource.close();
        };
    }, [user]);

    const markAsRead = (index) => {
        setNotifications(prev => {
            const updated = [...prev];
            updated[index].read = true;
            return updated;
        });
    };

    return { notifications, markAsRead };
};
