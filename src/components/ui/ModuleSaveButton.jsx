import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ModuleSaveButton = ({
  onSave,
  isSaving = false,
  label = 'Guardar',
  color = '#6366F1',
  icon = null,
}) => {
  return (
    <SaveButton
      type="button"
      onClick={onSave}
      disabled={isSaving}
      $bgColor={color}
      whileTap={{ scale: isSaving ? 1 : 0.97 }}
    >
      {isSaving ? (
        <>
          <Spinner />
          Guardando...
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </SaveButton>
  );
};

// --- STYLED COMPONENTS ---

const SaveButton = styled(motion.button)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: ${({ $bgColor }) => $bgColor};
  color: white;
  border: none;
  border-radius: 0;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;