import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import useAdmin from '../../hooks/useAdmin'
import { useAuthStore } from '../../stores/useAuthStore'
import { toast } from 'sonner'

export default function AdminPunishments() {
  const { currentUser } = useAuthStore()
  const { familyMembers, assignPunishment, isAssigningPunishment } = useAdmin()

  const [punishmentForm, setPunishmentForm] = useState({
    userId: '',
    reason: '',
    pointsDeducted: '',
    extraTask: '',
    dueDate: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPunishmentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitPunishment = (e) => {
    e.preventDefault()
    
    if (!punishmentForm.userId || !punishmentForm.reason) {
      toast.error('El usuario y el motivo son obligatorios')
      return
    }

    assignPunishment({
      userId: punishmentForm.userId,
      assignedBy: currentUser.id,
      reason: punishmentForm.reason,
      pointsDeducted: parseInt(punishmentForm.pointsDeducted) || 0,
      // 👇 La validación para que no lleguen espacios en blanco y funcione el botón
      extraTask: punishmentForm.extraTask?.trim() !== '' ? punishmentForm.extraTask : null,
      dueDate: punishmentForm.dueDate || null
    }, {
      onSuccess: () => {
        setPunishmentForm({ userId: '', reason: '', pointsDeducted: '', extraTask: '', dueDate: '' })
      }
    })
  }

  return (
    <Section>
      <SectionTitle>Nueva Penalización</SectionTitle>
      
      <Form onSubmit={handleSubmitPunishment}>
        <FormGroup>
          <Label>¿A quién vas a castigar?</Label>
          <Select 
            name="userId" 
            value={punishmentForm.userId} 
            onChange={handleInputChange}
            required
          >
            <option value="">Selecciona un usuario...</option>
            {familyMembers.filter(m => m.id !== currentUser?.id).map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Motivo del castigo</Label>
          <Input 
            name="reason" 
            type="text" 
            placeholder="Ej: Dejar la sala desordenada..." 
            value={punishmentForm.reason}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <Row>
          <FormGroup style={{ flex: 1 }}>
            <Label>Descontar Puntos</Label>
            <Input 
              name="pointsDeducted" 
              type="number" 
              min="0"
              placeholder="Ej: 50" 
              value={punishmentForm.pointsDeducted}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup style={{ flex: 1 }}>
            <Label>Fecha Límite (Opcional)</Label>
            <Input 
              name="dueDate" 
              type="date" 
              value={punishmentForm.dueDate}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>Tarea Extra (Opcional)</Label>
          <TextArea 
            name="extraTask" 
            placeholder="Ej: Lavar los platos de todos por 2 días" 
            value={punishmentForm.extraTask}
            onChange={handleInputChange}
            rows="3"
          />
        </FormGroup>

        <SubmitButton 
          type="submit" 
          disabled={isAssigningPunishment}
          whileTap={{ scale: 0.95 }}
        >
          {isAssigningPunishment ? 'Asignando...' : 'Aplicar Castigo'}
        </SubmitButton>
      </Form>
    </Section>
  )
}

// ==================== STYLED COMPONENTS DE CASTIGOS ====================
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 8px 0;
`
const Form = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Row = styled.div`
  display: flex;
  gap: 12px;
`
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`
const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const InputBase = `
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
  font-size: 15px;
  font-family: inherit;
  color: #0F172A;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #3B82F6;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`
const Select = styled.select`${InputBase}`
const Input = styled.input`${InputBase}`
const TextArea = styled.textarea`
  ${InputBase}
  resize: vertical;
`
const SubmitButton = styled(motion.button)`
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`