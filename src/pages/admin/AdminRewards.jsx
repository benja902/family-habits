import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsBellFill, BsCheckLg, BsClockHistory, BsFlagFill, BsPersonFill, BsStopFill, BsVolumeUpFill, BsXLg } from 'react-icons/bs'
import { AppHeader } from '../../components/layout/AppHeader'
import useAdmin from '../../hooks/useAdmin'
import { formatCountdownShort, formatDateES, formatDateTimeES, getCountdownParts } from '../../utils/dates.utils'
import { supabase } from '../../lib/supabaseClient'
import { finalizeExpiredRewardRedemptions, getAdminRewardRedemptionById } from '../../services/supabase'
import { toast } from 'sonner'

const SOUND_ENABLED_KEY = 'admin_rewards_sound_enabled'
const BROWSER_NOTIFICATIONS_KEY = 'admin_rewards_browser_notifications_enabled'

async function ensureAdminAudioContext(audioContextRef) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) return null

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass()
  }

  if (audioContextRef.current.state === 'suspended') {
    await audioContextRef.current.resume()
  }

  return audioContextRef.current
}

async function playAdminAlertTone(kind, audioContextRef) {
  const audioContext = await ensureAdminAudioContext(audioContextRef)

  if (!audioContext || audioContext.state !== 'running') return

  const now = audioContext.currentTime
  const pulses = kind === 'finished'
    ? [
        { start: 0, duration: 0.2, frequency: 1244, type: 'square', volume: 0.32 },
        { start: 0.24, duration: 0.2, frequency: 987, type: 'square', volume: 0.3 },
        { start: 0.5, duration: 0.26, frequency: 880, type: 'square', volume: 0.3 },
        { start: 0.82, duration: 0.34, frequency: 784, type: 'square', volume: 0.34 },
      ]
    : [
        { start: 0, duration: 0.18, frequency: 880, type: 'triangle', volume: 0.24 },
        { start: 0.24, duration: 0.18, frequency: 988, type: 'triangle', volume: 0.22 },
      ]

  pulses.forEach((pulse) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const startAt = now + pulse.start
    const endAt = startAt + pulse.duration

    oscillator.type = pulse.type
    oscillator.frequency.setValueAtTime(pulse.frequency, startAt)

    gainNode.gain.setValueAtTime(0.0001, startAt)
    gainNode.gain.exponentialRampToValueAtTime(pulse.volume, startAt + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start(startAt)
    oscillator.stop(endAt)
  })
}

async function notifyBrowser(title, body) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    tag: `reward-alert-${title}`,
    renotify: true,
    requireInteraction: true,
  })

  window.setTimeout(() => {
    notification.close()
  }, 7000)
}

export default function AdminRewards() {
  const [, setNow] = useState(0)
  const audioContextRef = useRef(null)
  const manuallyFinishedIdsRef = useRef(new Set())
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_ENABLED_KEY) === 'true')
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(
    () => localStorage.getItem(BROWSER_NOTIFICATIONS_KEY) === 'true'
  )
  const { 
    pendingRedemptions, 
    isLoadingRedemptions, 
    resolveRedemption, 
    isResolvingRedemption 
  } = useAdmin()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem(BROWSER_NOTIFICATIONS_KEY, String(browserNotificationsEnabled))
  }, [browserNotificationsEnabled])

  useEffect(() => {
    const channel = supabase
      .channel('admin-rewards-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reward_redemptions' },
        async (payload) => {
          const redemption = await getAdminRewardRedemptionById(payload.new.id).catch(() => null)
          if (!redemption || redemption.status !== 'pendiente') return

          toast.info(`Nuevo canje pendiente: ${redemption.users?.name || 'Usuario'} pidió ${redemption.rewards?.name || 'un premio'}.`)

          if (soundEnabled) {
            await playAdminAlertTone('pending', audioContextRef)
          }

          if (browserNotificationsEnabled) {
            await notifyBrowser(
              'Nuevo canje pendiente',
              `${redemption.users?.name || 'Un usuario'} pidió ${redemption.rewards?.name || 'un premio'}.`
            )
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reward_redemptions' },
        async (payload) => {
          if (payload.new.status !== 'finalizado' || payload.old.status === 'finalizado') return
          if (manuallyFinishedIdsRef.current.has(payload.new.id)) {
            manuallyFinishedIdsRef.current.delete(payload.new.id)
            return
          }
          if (!payload.new.timer_ends_at || new Date(payload.new.timer_ends_at).getTime() > Date.now()) return

          const redemption = await getAdminRewardRedemptionById(payload.new.id).catch(() => null)
          if (!redemption) return

          toast.success(`Tiempo terminado: ${redemption.users?.name || 'Usuario'} terminó ${redemption.rewards?.name || 'su premio'}.`)

          if (soundEnabled) {
            await playAdminAlertTone('finished', audioContextRef)
          }

          if (browserNotificationsEnabled) {
            await notifyBrowser(
              'Premio finalizado',
              `${redemption.users?.name || 'Un usuario'} terminó ${redemption.rewards?.name || 'su premio'}.`
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [browserNotificationsEnabled, soundEnabled])

  useEffect(() => {
    const syncExpiredRewards = async () => {
      try {
        await finalizeExpiredRewardRedemptions()
      } catch {
        // El error ya se registra en la capa de servicio; no interrumpimos la UI.
      }
    }

    syncExpiredRewards()
    const intervalId = window.setInterval(syncExpiredRewards, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
    }
  }, [])

  const handleToggleSound = () => {
    setSoundEnabled((current) => {
      const nextValue = !current

      if (nextValue) {
        ensureAdminAudioContext(audioContextRef)
          .then(() => playAdminAlertTone('pending', audioContextRef))
          .catch(() => {})
        toast.success('Sonido de alertas activado.')
      } else {
        toast.info('Sonido de alertas desactivado.')
      }

      return nextValue
    })
  }

  const handleToggleBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Este navegador no soporta notificaciones.')
      return
    }

    if (browserNotificationsEnabled) {
      setBrowserNotificationsEnabled(false)
      toast.info('Notificaciones del navegador desactivadas.')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      toast.error('No se otorgó permiso para notificaciones.')
      return
    }

    setBrowserNotificationsEnabled(true)
    toast.success('Notificaciones del navegador activadas.')
  }

  const queuedRedemptions = pendingRedemptions.filter((redemption) => redemption.status === 'pendiente')
  const activeRedemptions = pendingRedemptions.filter((redemption) => redemption.status === 'activo')

  const hasRequests = queuedRedemptions.length > 0 || activeRedemptions.length > 0

  return (
    <Container>
      <AppHeader title="Aprobar Premios" />
      <ContentSection>
        <AlertsPanel>
          <AlertsTitle>Alertas del admin</AlertsTitle>
          <AlertsDescription>Solo funcionan mientras esta pantalla permanezca abierta.</AlertsDescription>
          <AlertsActions>
            <AlertToggle type="button" $enabled={soundEnabled} onClick={handleToggleSound}>
              <BsVolumeUpFill />
              {soundEnabled ? 'Sonido activado' : 'Activar sonido'}
            </AlertToggle>
            <AlertToggle
              type="button"
              $enabled={browserNotificationsEnabled}
              onClick={handleToggleBrowserNotifications}
            >
              <BsBellFill />
              {browserNotificationsEnabled ? 'Notificaciones activadas' : 'Activar notificaciones'}
            </AlertToggle>
          </AlertsActions>
        </AlertsPanel>

        {isLoadingRedemptions ? (
          <EmptyText>Buscando solicitudes...</EmptyText>
        ) : !hasRequests ? (
          <EmptyText>No hay premios pendientes de aprobación. ¡Todo al día!</EmptyText>
        ) : (
          <>
            {queuedRedemptions.length > 0 && (
              <Section>
                <SectionTitle>Solicitudes pendientes</SectionTitle>
                {queuedRedemptions.map((redemption) => {
                  const duration = redemption.duration_minutes_snapshot || redemption.rewards?.duration_minutes

                  return (
                    <RequestCard
                      key={redemption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <RequestInfo>
                        <UserRow>
                          <Avatar>
                            {redemption.users?.avatar_url ? (
                              <img src={redemption.users.avatar_url} alt="avatar" />
                            ) : (
                              <BsPersonFill />
                            )}
                          </Avatar>
                          <UserName>{redemption.users?.name}</UserName>
                          <DateText>{formatDateES(redemption.created_at.split('T')[0])}</DateText>
                        </UserRow>
                        <RewardName>{redemption.rewards?.name}</RewardName>
                        <MetaRow>
                          <RewardCost>-{redemption.rewards?.points_required || redemption.points_cost} pts</RewardCost>
                          {redemption.rewards?.is_timed && duration ? (
                            <TimerChip>
                              <BsClockHistory />
                              {duration} min
                            </TimerChip>
                          ) : (
                            <DeliveryChip>Entrega directa</DeliveryChip>
                          )}
                        </MetaRow>
                      </RequestInfo>

                      <ActionButtons>
                        <RejectButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'reject' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsXLg /> Rechazar
                        </RejectButton>
                        <ApproveButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'approve' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsCheckLg /> {redemption.rewards?.is_timed ? 'Activar' : 'Entregar'}
                        </ApproveButton>
                      </ActionButtons>
                    </RequestCard>
                  )
                })}
              </Section>
            )}

            {activeRedemptions.length > 0 && (
              <Section>
                <SectionTitle>Premios activos</SectionTitle>
                {activeRedemptions.map((redemption) => {
                  const countdown = getCountdownParts(redemption.timer_ends_at)
                  const isExpired = countdown.isExpired

                  return (
                    <ActiveCard
                      key={redemption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <RequestInfo>
                        <UserRow>
                          <Avatar>
                            {redemption.users?.avatar_url ? (
                              <img src={redemption.users.avatar_url} alt="avatar" />
                            ) : (
                              <BsPersonFill />
                            )}
                          </Avatar>
                          <UserName>{redemption.users?.name}</UserName>
                          <DateText>{formatDateES(redemption.created_at.split('T')[0])}</DateText>
                        </UserRow>
                        <RewardName>{redemption.rewards?.name}</RewardName>
                        <MetaRow>
                          <RewardCost>-{redemption.rewards?.points_required || redemption.points_cost} pts</RewardCost>
                          <TimerChip $expired={isExpired}>
                            <BsClockHistory />
                            {isExpired ? 'Listo para cerrar' : formatCountdownShort(redemption.timer_ends_at)}
                          </TimerChip>
                        </MetaRow>
                        <TimerDetails>
                          Inició: {formatDateTimeES(redemption.timer_started_at) || 'Sin registrar'}
                        </TimerDetails>
                        <TimerDetails>
                          Termina: {formatDateTimeES(redemption.timer_ends_at) || 'Sin registrar'}
                        </TimerDetails>
                      </RequestInfo>

                      <ActionButtons>
                        <RejectButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'cancel' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsStopFill /> Cancelar
                        </RejectButton>
                        <ApproveButton
                          onClick={() => {
                            manuallyFinishedIdsRef.current.add(redemption.id)
                            resolveRedemption({ id: redemption.id, action: 'finish' })
                          }}
                          disabled={isResolvingRedemption}
                        >
                          <BsFlagFill /> Finalizar
                        </ApproveButton>
                      </ActionButtons>
                    </ActiveCard>
                  )
                })}
              </Section>
            )}
          </>
        )}
      </ContentSection>
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`
const ContentSection = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const AlertsPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const AlertsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const AlertsDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const AlertsActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
const AlertToggle = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: ${({ $enabled, theme }) => ($enabled ? `${theme.colors.success}18` : theme.colors.background)};
  color: ${({ $enabled, theme }) => ($enabled ? theme.colors.success : theme.colors.textSecondary)};
`
const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const SectionTitle = styled.h3`
  margin: 0;
  padding: 0 4px;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 40px 20px;
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`
const RequestCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const ActiveCard = styled(RequestCard)`
  border-color: ${({ theme }) => `${theme.colors.success}55`};
`
const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textSecondary};
  img { width: 100%; height: 100%; object-fit: cover; }
`
const UserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`
const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const RewardName = styled.h4`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const RewardCost = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.warning};
`
const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`
const TimerChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $expired, theme }) => ($expired ? theme.colors.danger : theme.colors.primary)};
  background: ${({ $expired, theme }) => ($expired ? `${theme.colors.danger}14` : `${theme.colors.primary}15`)};
`
const DeliveryChip = styled(TimerChip)`
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => `${theme.colors.success}15`};
`
const TimerDetails = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`
const BaseButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`
const RejectButton = styled(BaseButton)`
  background: ${({ theme }) => `${theme.colors.danger}15`};
  color: ${({ theme }) => theme.colors.danger};
`
const ApproveButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
`
