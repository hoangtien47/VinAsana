import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuth } from './use-auth'
import { useAuth0 } from '@auth0/auth0-react'
import { useToast } from './use-toast'

export interface TaskNotification {
  id: string
  title: string
  description?: string
  endDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  projectId: string
}

export const useWebSocketNotifications = () => {
  const { user } = useAuth()
  const { getAccessTokenSilently } = useAuth0()
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<TaskNotification[]>([])
  const clientRef = useRef<Client | null>(null)
  const connect = useCallback(async () => {
    if (!user?.sub) {
      console.log('WebSocket: User not authenticated, skipping connection')
      return
    }

    if (clientRef.current?.connected) {
      console.log('WebSocket: Already connected')
      return
    }

    try {
      console.log('WebSocket: Attempting to connect...')
      const accessToken = await getAccessTokenSilently()

      const client = new Client({
        brokerURL: 'ws://localhost:8080/stomp',
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      client.onConnect = (frame) => {
        setIsConnected(true)

        // Subscribe to task reminder queue for the authenticated user
        const subscription = client.subscribe(
          `/queue/users.${user.sub}.task-reminders`,
          (message) => {
            try {
              const taskNotification: TaskNotification = JSON.parse(message.body)
              
              // Add to notifications list
              setNotifications(prev => [taskNotification, ...prev.slice(0, 9)]) // Keep last 10 notifications
              
              // Show toast notification
              toast({
                title: "Task Deadline Reminder",
                description: `Task "${taskNotification.title}" is due on ${new Date(taskNotification.endDate).toLocaleDateString()}`,
                variant: taskNotification.priority === 'HIGH' ? 'destructive' : 'default',
              })
            } catch (error) {
              console.error('WebSocket: Error parsing notification:', error)
            }
          }
        )
        
      }

      client.onStompError = (frame) => {
        console.error('WebSocket: STOMP error:', frame.headers['message'])
        console.error('WebSocket: Error details:', frame.body)
        setIsConnected(false)
      }

      client.onWebSocketError = (error) => {
        console.error('WebSocket: WebSocket error:', error)
        setIsConnected(false)
      }

      client.onDisconnect = (frame) => {
        console.log('WebSocket: Disconnected from STOMP server', frame)
        setIsConnected(false)
      }

      clientRef.current = client
      client.activate()
    } catch (error) {
      console.error('WebSocket: Failed to get access token or connect:', error)
      setIsConnected(false)
    }
  }, [user?.sub, getAccessTokenSilently, toast])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('WebSocket: Disconnecting...')
      clientRef.current.deactivate()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])
  // Connect when user is authenticated
  useEffect(() => {
    if (user?.sub) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [user?.sub, connect, disconnect])

  // Reconnect on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.sub && !isConnected) {
        console.log('WebSocket: Page became visible, attempting to reconnect...')
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user?.sub, isConnected, connect])

  return {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
    connect,
    disconnect,
  }
}
