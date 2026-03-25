/**
 * Pantalla de ingreso de PIN.
 * El usuario ingresa su PIN de 4 dígitos para iniciar sesión.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { validatePin } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

// Función auxiliar para obtener las iniciales del nombre
const getInitials = (name) => {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const PinEntry = () => {
  const navigate = useNavigate();
  const selectedUser = useAuthStore((state) => state.selectedUser);
  const login = useAuthStore((state) => state.login);
  const clearSelectedUser = useAuthStore((state) => state.clearSelectedUser);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const isLoggingIn = useRef(false);

  // Redirigir si no hay usuario seleccionado
  useEffect(() => {
    if (!selectedUser && !isLoggingIn.current) {
      navigate('/');
    }
  }, [selectedUser, navigate]);


  // Mutation para validar el PIN
  const validatePinMutation = useMutation({
    mutationFn: ({ userId, pin }) => validatePin(userId, pin),
    onSuccess: (isValid) => {
      if (isValid) {
        // const userRole = selectedUser.role; // (Puedes borrar esta línea, ya no se usa)
        isLoggingIn.current = true;
        login(selectedUser);
        navigate('/dashboard', { replace: true });
      } else {
        setError('PIN incorrecto, intenta de nuevo');
        setShake(true);
        setPin('');
        setTimeout(() => {
          setShake(false);
          setError('');
        }, 600);
      }
    },
    onError: () => {
      setError('Error al validar el PIN');
      setShake(true);
      setPin('');
      setTimeout(() => {
        setShake(false);
        setError('');
      }, 600);
    },
  });

  // Auto-validar cuando se completa el PIN
  useEffect(() => {
  if (pin.length === 4 && selectedUser?.id) {
    validatePinMutation.mutate({ userId: selectedUser.id, pin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, selectedUser]);

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleGoBack = () => {
    clearSelectedUser();
    navigate('/');
  };

  // Redirigir si no hay usuario seleccionado
  if (!selectedUser && !isLoggingIn.current) {
    return null;
  }

  return (
    <Container>
      <BackButton onClick={handleGoBack}>← Volver</BackButton>

      <Card>
        <AvatarContainer>
          {selectedUser?.avatar_url ? (
            <Avatar src={selectedUser.avatar_url} alt={selectedUser.name} />
          ) : (
            <AvatarPlaceholder>
              {selectedUser && getInitials(selectedUser.name)}
            </AvatarPlaceholder>
          )}
          <UserName>{selectedUser?.name}</UserName>
        </AvatarContainer>

        <Title>Ingresa tu PIN</Title>

        <PinDisplay $shake={shake}>
          {[0, 1, 2, 3].map((index) => (
            <PinDot key={index} $filled={index < pin.length} />
          ))}
        </PinDisplay>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Keyboard>
          <KeyboardRow>
            <KeyButton onClick={() => handleNumberClick('1')} whileTap={{ scale: 0.92 }}>1</KeyButton>
            <KeyButton onClick={() => handleNumberClick('2')} whileTap={{ scale: 0.92 }}>2</KeyButton>
            <KeyButton onClick={() => handleNumberClick('3')} whileTap={{ scale: 0.92 }}>3</KeyButton>
          </KeyboardRow>
          <KeyboardRow>
            <KeyButton onClick={() => handleNumberClick('4')} whileTap={{ scale: 0.92 }}>4</KeyButton>
            <KeyButton onClick={() => handleNumberClick('5')} whileTap={{ scale: 0.92 }}>5</KeyButton>
            <KeyButton onClick={() => handleNumberClick('6')} whileTap={{ scale: 0.92 }}>6</KeyButton>
          </KeyboardRow>
          <KeyboardRow>
            <KeyButton onClick={() => handleNumberClick('7')} whileTap={{ scale: 0.92 }}>7</KeyButton>
            <KeyButton onClick={() => handleNumberClick('8')} whileTap={{ scale: 0.92 }}>8</KeyButton>
            <KeyButton onClick={() => handleNumberClick('9')} whileTap={{ scale: 0.92 }}>9</KeyButton>
          </KeyboardRow>
          <KeyboardRow>
            <KeyButton disabled />
            <KeyButton onClick={() => handleNumberClick('0')} whileTap={{ scale: 0.92 }}>0</KeyButton>
            <KeyButton onClick={handleBackspace} whileTap={{ scale: 0.92 }}>⌫</KeyButton>
          </KeyboardRow>
        </Keyboard>
      </Card>
    </Container>
  );
};

// Animación shake
const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
`;

// Styled Components

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  left: ${({ theme }) => theme.spacing.lg};
  background: transparent;
  border: none;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm} 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface};
`;

const UserName = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
`;

const PinDisplay = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  animation: ${({ $shake }) => ($shake ? shakeAnimation : 'none')} 0.5s ease;
`;

const PinDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ $filled, theme }) =>
    $filled ? theme.colors.primary : theme.colors.border};
  background: ${({ $filled, theme }) =>
    $filled ? theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Keyboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const KeyboardRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const KeyButton = styled(motion.button)`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}15;
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0;
    cursor: default;
    border: none;
  }
`;

export default PinEntry;
