/**
 * AdminUsers.jsx — Gestión de usuarios del sistema
 * Solo accesible por el admin (Benjamín)
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  BsPencilFill,
  BsPersonPlusFill,
  BsToggleOn,
  BsToggleOff,
  BsXLg,
  BsShieldFillCheck,
  BsPersonFill
} from 'react-icons/bs'
import { AppHeader } from '../../components/layout/AppHeader'
import useAdmin from '../../hooks/useAdmin'

export default function AdminUsers() {
  const {
    allUsers,
    isLoadingUsers,
    updateUser,
    isUpdatingUser,
    toggleUser,
    isTogglingUser,
    createUser,
    isCreatingUser
  } = useAdmin()

  const [editingUser, setEditingUser] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  // Separar usuarios activos e inactivos
  const activeUsers = allUsers.filter(u => u.is_active)
  const inactiveUsers = allUsers.filter(u => !u.is_active)

  return (
    <Container>
      <AppHeader title="Gestión de Usuarios" />

      <ContentSection>
        {/* Botón crear usuario */}
        <CreateButton
          onClick={() => setIsCreating(true)}
          whileTap={{ scale: 0.95 }}
        >
          <BsPersonPlusFill size={20} />
          Crear nuevo usuario
        </CreateButton>

        {/* Lista de usuarios activos */}
        <SectionTitle>Usuarios Activos ({activeUsers.length})</SectionTitle>

        {isLoadingUsers ? (
          <LoadingText>Cargando usuarios...</LoadingText>
        ) : activeUsers.length === 0 ? (
          <EmptyText>No hay usuarios activos</EmptyText>
        ) : (
          <UserGrid>
            {activeUsers.map((user) => (
              <UserCard
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UserInfo>
                  <Avatar $url={user.avatar_url}>
                    {!user.avatar_url && user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <RoleBadge $isAdmin={user.role === 'admin'}>
                      {user.role === 'admin' ? (
                        <><BsShieldFillCheck size={12} /> Admin</>
                      ) : (
                        <><BsPersonFill size={12} /> Usuario</>
                      )}
                    </RoleBadge>
                  </UserDetails>
                </UserInfo>

                <UserActions>
                  <ActionButton
                    onClick={() => setEditingUser(user)}
                    whileTap={{ scale: 0.9 }}
                    title="Editar usuario"
                  >
                    <BsPencilFill size={16} />
                  </ActionButton>

                  {user.role !== 'admin' && (
                    <ToggleButton
                      $isActive={user.is_active}
                      onClick={() => toggleUser({ userId: user.id, isActive: false })}
                      disabled={isTogglingUser}
                      whileTap={{ scale: 0.9 }}
                      title="Desactivar usuario"
                    >
                      <BsToggleOn size={24} />
                    </ToggleButton>
                  )}
                </UserActions>
              </UserCard>
            ))}
          </UserGrid>
        )}

        {/* Lista de usuarios inactivos */}
        {inactiveUsers.length > 0 && (
          <>
            <SectionTitle $inactive>Usuarios Inactivos ({inactiveUsers.length})</SectionTitle>
            <UserGrid>
              {inactiveUsers.map((user) => (
                <UserCard
                  key={user.id}
                  $inactive
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <UserInfo>
                    <Avatar $url={user.avatar_url} $inactive>
                      {!user.avatar_url && user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <UserDetails>
                      <UserName $inactive>{user.name}</UserName>
                      <StatusBadge $inactive>Inactivo</StatusBadge>
                    </UserDetails>
                  </UserInfo>

                  <UserActions>
                    <ToggleButton
                      $isActive={false}
                      onClick={() => toggleUser({ userId: user.id, isActive: true })}
                      disabled={isTogglingUser}
                      whileTap={{ scale: 0.9 }}
                      title="Activar usuario"
                    >
                      <BsToggleOff size={24} />
                    </ToggleButton>
                  </UserActions>
                </UserCard>
              ))}
            </UserGrid>
          </>
        )}
      </ContentSection>

      {/* Modal de edición */}
      <AnimatePresence>
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(updates) => {
              updateUser({ userId: editingUser.id, updates })
              setEditingUser(null)
            }}
            isSaving={isUpdatingUser}
          />
        )}
      </AnimatePresence>

      {/* Modal de crear usuario */}
      <AnimatePresence>
        {isCreating && (
          <CreateUserModal
            onClose={() => setIsCreating(false)}
            onCreate={(userData) => {
              createUser(userData)
              setIsCreating(false)
            }}
            isCreating={isCreatingUser}
          />
        )}
      </AnimatePresence>
    </Container>
  )
}

// ==================== MODAL DE EDICIÓN ====================
function EditUserModal({ user, onClose, onSave, isSaving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user.name,
      avatar_url: user.avatar_url || '',
      pin: user.pin || '',
    }
  })

  const onSubmit = (data) => {
    // Solo enviar campos que cambiaron
    const updates = {}
    if (data.name !== user.name) updates.name = data.name
    if (data.avatar_url !== (user.avatar_url || '')) updates.avatar_url = data.avatar_url || null
    if (data.pin && data.pin !== user.pin) updates.pin = data.pin

    if (Object.keys(updates).length > 0) {
      onSave(updates)
    } else {
      onClose()
    }
  }

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>Editar Usuario</ModalTitle>
          <CloseButton onClick={onClose}>
            <BsXLg size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input
              {...register('name', { required: 'El nombre es obligatorio' })}
              placeholder="Nombre del usuario"
            />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>URL del Avatar (opcional)</Label>
            <Input
              {...register('avatar_url')}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </FormGroup>

          <FormGroup>
            <Label>PIN (4 dígitos)</Label>
            <Input
              {...register('pin', {
                pattern: {
                  value: /^\d{4}$/,
                  message: 'El PIN debe ser de 4 dígitos'
                }
              })}
              placeholder="****"
              maxLength={4}
              inputMode="numeric"
            />
            {errors.pin && <ErrorText>{errors.pin.message}</ErrorText>}
            <HelpText>Deja vacío para mantener el PIN actual</HelpText>
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </SaveButton>
          </ModalActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  )
}

// ==================== MODAL DE CREAR USUARIO ====================
function CreateUserModal({ onClose, onCreate, isCreating }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      avatar_url: '',
      pin: '',
    }
  })

  const onSubmit = (data) => {
    onCreate({
      name: data.name,
      pin: data.pin,
      avatar_url: data.avatar_url || null,
    })
  }

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>Crear Nuevo Usuario</ModalTitle>
          <CloseButton onClick={onClose}>
            <BsXLg size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Nombre *</Label>
            <Input
              {...register('name', { required: 'El nombre es obligatorio' })}
              placeholder="Nombre del usuario"
            />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>PIN (4 dígitos) *</Label>
            <Input
              {...register('pin', {
                required: 'El PIN es obligatorio',
                pattern: {
                  value: /^\d{4}$/,
                  message: 'El PIN debe ser de 4 dígitos'
                }
              })}
              placeholder="1234"
              maxLength={4}
              inputMode="numeric"
            />
            {errors.pin && <ErrorText>{errors.pin.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>URL del Avatar (opcional)</Label>
            <Input
              {...register('avatar_url')}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear usuario'}
            </SaveButton>
          </ModalActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  )
}

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`
const ContentSection = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const CreateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}10`};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}20`};
  }
`
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme, $inactive }) => $inactive ? theme.colors.textSecondary : theme.colors.textPrimary};
  margin-top: 8px;
`
const LoadingText = styled.p`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const EmptyText = styled.p`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`
const UserGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const UserCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  opacity: ${({ $inactive }) => $inactive ? 0.6 : 1};
`
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`
const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $url, $inactive, theme }) =>
    $url ? `url(${$url}) center/cover` :
    $inactive ? theme.colors.border : theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  filter: ${({ $inactive }) => $inactive ? 'grayscale(100%)' : 'none'};
`
const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const UserName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme, $inactive }) => $inactive ? theme.colors.textSecondary : theme.colors.textPrimary};
`
const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme, $isAdmin }) => $isAdmin ? theme.colors.primary : theme.colors.textSecondary};
`
const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const ActionButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`
const ToggleButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.success : theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// Modal styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 200;
`
const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
`
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
`
const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Form = styled.form`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`
const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.5;
  }
`
const ErrorText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`
const HelpText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`
const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`
const SaveButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
