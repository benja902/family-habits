import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export function RankingList({ users, currentUser }) {
  if (!users || users.length === 0) return null

  return (
    <ListSection>
      {users.map((user, index) => {
        const position = index + 4
        const isMe = user.id === currentUser?.id
        
        return (
          <ListItem 
            key={user.id} 
            $isMe={isMe}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <PositionCircle>{position}</PositionCircle>
            
            <ListAvatarContainer $isMe={isMe}>
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.name} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </ListAvatarContainer>
            
            <ListName $isMe={isMe}>{user.name}</ListName>
            <ListPoints>{user.totalEarned.toLocaleString()} pts</ListPoints>
          </ListItem>
        )
      })}
    </ListSection>
  )
}

// ==================== STYLED COMPONENTS ====================
const ListSection = styled.div`
  display: flex; flex-direction: column; gap: 12px;
  padding: 0 16px; padding-bottom: 100px; /* Para que el BottomNav no lo tape */
`
const ListItem = styled(motion.div)`
  display: flex; align-items: center;
  background: ${({ $isMe, theme }) => ($isMe ? `${theme.colors.primary}15` : theme.colors.surface)};
  border: 1px solid ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.border)};
  padding: 12px 16px; border-radius: 16px; box-shadow: ${({ theme }) => theme.shadows.card};
`
const PositionCircle = styled.div`
  width: 28px; height: 28px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; margin-right: 12px;
`
const ListAvatarContainer = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.border)};
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; margin-right: 12px; overflow: hidden;
`
const AvatarImage = styled.img`width: 100%; height: 100%; object-fit: cover;`
const ListName = styled.span`
  flex: 1; font-size: 16px; font-weight: 700;
  color: ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.textPrimary)};
`
const ListPoints = styled.span`
  font-size: 15px; font-weight: 800; color: ${({ theme }) => theme.colors.textSecondary};
`