"use client";

import styled from "styled-components";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledPage>
      <GlowBg />
      <StyledContent>
        <StyledBrand>
          <StyledIconBox>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"
                fill="white"
              />
            </svg>
          </StyledIconBox>
          <StyledLogoTitle>LoadUp</StyledLogoTitle>
          <StyledTagline>Seu treino. Sua evolução.</StyledTagline>
        </StyledBrand>
        {children}
      </StyledContent>
    </StyledPage>
  );
}

// html/body nao rolam mais (app shell), entao a tela de auth precisa ser o
// proprio container de rolagem — caso contrario o formulario fica inacessivel
// em telas baixas ou com o teclado aberto.
const StyledPage = styled.div`
  height: 100%;
  min-height: 100%;
  background-color: #1e293b;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
`;

const GlowBg = styled.div`
  pointer-events: none;
  position: absolute;
  top: -128px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.35) 0%,
    rgba(59, 130, 246, 0.08) 35%,
    transparent 70%
  );
`;

const StyledContent = styled.div`
  position: relative;
  width: 100%;
  padding: 64px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const StyledBrand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const StyledIconBox = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 32px rgba(59, 130, 246, 0.35);
`;

const StyledLogoTitle = styled.h1`
  font-family: var(--font-bebas), sans-serif;
  font-size: 48px;
  line-height: 1;
  letter-spacing: 0.05em;
  color: white;
`;

const StyledTagline = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 14px;
  color: white;
  text-align: center;
`;
