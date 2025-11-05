import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 🛑 CORREÇÃO AQUI:

    // Opção 1: Usar o método mais simples, que é INSTANTÂNEO por defeito.
    window.scrollTo(0, 0); 

    /*
    // Opção 2: Usar o objeto de opções, mas definir 'auto' para instantâneo.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // 'auto' força o scroll instantâneo
    });
    */

  }, [pathname]);

  return null;
};

export default ScrollToTop;