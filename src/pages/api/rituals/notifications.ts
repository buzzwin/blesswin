import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, query, where, addDoc, updateDoc, doc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';

interface Notification {
  id?: string;
  userId: string;
  type: 'friend_joined' | 'achievement_unlocked' | 'streak_reminder' | 'level_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
}

interface CreateNotificationRequest {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationsResponse | { success: boolean; error?: string }>
): Promise<void> {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ success: false, error: 'User ID is required' });
        return;
      }

      const notificationsRef = collection(db, 'ritual_notifications');
      const notificationsQuery = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Notification));

      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, type, title, message, actionUrl } = req.body as CreateNotificationRequest;

      if (!userId || !type || !title || !message) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      const notificationsRef = collection(db, 'ritual_notifications');
      await addDoc(notificationsRef, {
        userId,
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        read: false,
        createdAt: serverTimestamp()
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ success: false, error: 'Failed to create notification' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { notificationId, read } = req.body;

      if (!notificationId) {
        res.status(400).json({ success: false, error: 'Notification ID is required' });
        return;
      }

      const notificationRef = doc(db, 'ritual_notifications', notificationId);
      await updateDoc(notificationRef, {
        read: read !== undefined ? read : true
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

