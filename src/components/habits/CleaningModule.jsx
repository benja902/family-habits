import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsHouseHeartFill, BsStars, BsCheckCircleFill } from 'react-icons/bs'
import useCleaningModule from '../../hooks/useCleaningModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'

const MODULE_COLOR = '#EAB308' // theme.HABIT_COLORS.cleaning

export default function CleaningModule() {
  const { cleaningRecord, isLoading, hasRecord, saveCleaning, isSaving } = useCleaningModule()

  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      bed_made: false,
      room_clean: false,
      space_ordered: false,
      notes: '',
    },
  })

  useEffect(() => {
    if (cleaningRecord) {
      reset({
        bed_made: cleaningRecord.bed_made || false,
        room_clean: cleaningRecord.room_clean || false,
        space_ordered: cleaningRecord.space_ordered || false,
        notes: cleaningRecord.notes || '',
      })
    }
  }, [cleaningRecord, reset])

  const formValues = watch()
  const bedMade = formValues.bed_made
  const roomClean = formValues.room_clean
  const spaceOrdered = formValues.space_ordered
  
  const allCompleted = bedMade && roomClean && spaceOrdered

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      notes: data.notes || null,
    }
    saveCleaning(cleanData)
  }

  if (isLoading) return <LoadingText>Cargando información...</LoadingText>

  return (
    <Container>
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            ✓ Ya registraste tu orden hoy
          </Banner>
        )}
      </AnimatePresence>

      <Form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Card 1: Cama */}
        <LargeToggleCard
          $isOn={bedMade}
          onClick={() => setValue('bed_made', !bedMade)}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: bedMade ? [1, 1.03, 0.98, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <IconWrapper $isOn={bedMade}><BsHouseHeartFill /></IconWrapper>
          <TextContent>
            <CardTitle>Tendí mi cama</CardTitle>
          </TextContent>
          <RightAction>
            {bedMade && <Badge>+50 pts</Badge>}
            <ToggleSwitch $isOn={bedMade}>
              <ToggleThumb $isOn={bedMade} />
            </ToggleSwitch>
          </RightAction>
        </LargeToggleCard>

        {/* Card 2: Cuarto */}
        <LargeToggleCard
          $isOn={roomClean}
          onClick={() => setValue('room_clean', !roomClean)}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: roomClean ? [1, 1.03, 0.98, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <IconWrapper $isOn={roomClean}><BsStars /></IconWrapper>
          <TextContent>
            <CardTitle>Mi cuarto está limpio</CardTitle>
          </TextContent>
          <RightAction>
            {roomClean && <Badge>+50 pts</Badge>}
            <ToggleSwitch $isOn={roomClean}>
              <ToggleThumb $isOn={roomClean} />
            </ToggleSwitch>
          </RightAction>
        </LargeToggleCard>

        {/* Card 3: Espacio ordenado */}
        <LargeToggleCard
          $isOn={spaceOrdered}
          onClick={() => setValue('space_ordered', !spaceOrdered)}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: spaceOrdered ? [1, 1.03, 0.98, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <IconWrapper $isOn={spaceOrdered}><BsCheckCircleFill /></IconWrapper>
          <TextContent>
            <CardTitle>Mi espacio está ordenado</CardTitle>
          </TextContent>
          <RightAction>
            {spaceOrdered && <Badge>+30 pts</Badge>}
            <ToggleSwitch $isOn={spaceOrdered}>
              <ToggleThumb $isOn={spaceOrdered} />
            </ToggleSwitch>
          </RightAction>
        </LargeToggleCard>

        {/* Mensaje Motivacional */}
        <AnimatePresence>
          {allCompleted && (
            <MotivationalMessage
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ¡Perfecto! 🌟 Tienes todo en orden
            </MotivationalMessage>
          )}
        </AnimatePresence>

        {/* Notas Opcionales */}
        <Textarea
          rows="2"
          placeholder="Notas opcionales (ej: barrí el cuarto, cambié las sábanas...)"
          {...register('notes')}
        />

        {/* Área Inferior Estándar */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Cama tendida', points: bedMade ? 50 : 0, color: MODULE_COLOR },
            { label: 'Cuarto limpio', points: roomClean ? 50 : 0, color: MODULE_COLOR },
            { label: 'Espacio ordenado', points: spaceOrdered ? 30 : 0, color: MODULE_COLOR },
          ]}
          totalPoints={(bedMade ? 50 : 0) + (roomClean ? 50 : 0) + (spaceOrdered ? 30 : 0)}
          accentColor={MODULE_COLOR}
        />
        <FooterSpacer />
      </Form>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar orden"
        color={MODULE_COLOR}
        icon={<BsStars />}
      />
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding-bottom: 80px;
`
const Form = styled.form`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Banner = styled(motion.div)`
  background: #FEF08A; /* Amarillo suave */
  color: #854D0E;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`
const LargeToggleCard = styled(motion.div)`
  min-height: 72px;
  padding: 20px;
  background: ${({ $isOn, theme }) => ($isOn ? `${MODULE_COLOR}1F` : theme.colors.surface)};
  border: ${({ $isOn, theme }) => ($isOn ? `1.5px solid ${MODULE_COLOR}66` : `1px solid ${theme.colors.border}`)};
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.card};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`
const IconWrapper = styled.div`
  font-size: 28px;
  color: ${({ $isOn, theme }) => ($isOn ? MODULE_COLOR : theme.colors.textSecondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
`
const TextContent = styled.div`
  flex: 1;
`
const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const RightAction = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`
const Badge = styled.span`
  background: ${MODULE_COLOR};
  color: white;
  font-size: 13px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
`
const ToggleSwitch = styled.div`
  width: 52px;
  height: 28px;
  background: ${({ $isOn, theme }) => ($isOn ? MODULE_COLOR : theme.colors.border)};
  border-radius: 14px;
  position: relative;
  flex-shrink: 0;
  transition: background 0.3s ease;
`
const ToggleThumb = styled.div`
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: ${({ $isOn }) => ($isOn ? '28px' : '4px')};
  transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`
const MotivationalMessage = styled(motion.p)`
  text-align: center;
  color: ${MODULE_COLOR};
  font-weight: 800;
  font-size: 18px;
  margin: 8px 0;
`
const Textarea = styled.textarea`
  width: 100%;
  padding: 16px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 8px;
  &:focus { outline: none; border-color: ${MODULE_COLOR}; }
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `