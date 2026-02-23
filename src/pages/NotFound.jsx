import styled from "styled-components";
import { Link } from "react-router-dom";
import { useThemeStore } from "../store/ThemeStore";

export const NotFound = () => {
    const { themeStyle } = useThemeStore();

    return (
        <Container>
            <Content className="glass animate-up">
                <ErrorCode>404</ErrorCode>
                <h1>Vaya, parece que te has perdido</h1>
                <p>La página que buscas no existe o ha sido movida a otra dimensión.</p>
                <Actions>
                    <HomeLink to="/">
                        <span>🏠</span> Volver al inicio
                    </HomeLink>
                </Actions>
            </Content>
            <BackgroundElements>
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
            </BackgroundElements>
        </Container>
    );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  overflow: hidden;
  position: relative;
`;

const Content = styled.div`
  text-align: center;
  padding: 60px;
  border-radius: 30px;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  max-width: 500px;
  width: 90%;
  z-index: 10;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5);

  h1 {
    font-size: 28px;
    margin-bottom: 15px;
    color: ${({ theme }) => theme.text};
  }

  p {
    color: ${({ theme }) => theme.text}88;
    margin-bottom: 30px;
    line-height: 1.6;
  }
`;

const ErrorCode = styled.div`
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary} 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  line-height: 1;
  letter-spacing: -5px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
`;

const HomeLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 14px 28px;
  border-radius: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px -5px ${({ theme }) => theme.primary}66;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px -5px ${({ theme }) => theme.primary}88;
  }
`;

const BackgroundElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: ${({ theme }) => theme.primary};
    top: -100px;
    right: -100px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: #ff8c00;
    bottom: -50px;
    left: -50px;
  }
`;
