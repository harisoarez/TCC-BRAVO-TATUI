/**
 * INSTITUTO MUSICAL BRAVO — TATUÍ / SP
 * Interactions & Editorial Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll state
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile drawer menu
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('is-open');
      mobileDrawer.classList.toggle('is-open', isOpen);
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }

  // 3. Terceira Dobra: Troca suave da foto de fundo ao passar o mouse sobre os instrumentos
  const instrumentItems = document.querySelectorAll('.instrument-item');
  const bgItems = document.querySelectorAll('.instrument-bg-item');

  function setInstrumentBackground(targetKey) {
    bgItems.forEach(bg => {
      if (bg.dataset.bg === targetKey) {
        bg.classList.add('is-active');
      } else {
        bg.classList.remove('is-active');
      }
    });

    instrumentItems.forEach(item => {
      if (item.dataset.instrument === targetKey) {
        item.classList.add('is-highlighted');
      } else {
        item.classList.remove('is-highlighted');
      }
    });
  }

  instrumentItems.forEach(item => {
    const instrumentKey = item.dataset.instrument;

    // Hover mouse
    item.addEventListener('mouseenter', () => {
      setInstrumentBackground(instrumentKey);
    });

    // Teclado (acessibilidade por foco)
    item.addEventListener('focus', () => {
      setInstrumentBackground(instrumentKey);
    });

    // Clique / Toque em dispositivos móveis
    item.addEventListener('click', () => {
      setInstrumentBackground(instrumentKey);
    });
  });

  // 4. Sistema de Modais (Agendar Aula / Consultar Horários)
  const openModalButtons = document.querySelectorAll('.open-modal-btn');
  const closeButtons = document.querySelectorAll('[data-close-modal]');
  const modals = document.querySelectorAll('.modal-backdrop');

  function openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Foco no primeiro input se existir
      const firstInput = modal.querySelector('input, select, button');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modal) {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalTarget = btn.dataset.modal;
      if (modalTarget) {
        openModal(modalTarget);
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentModal = btn.closest('.modal-backdrop');
      if (parentModal) closeModal(parentModal);
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('is-active')) {
          closeModal(modal);
        }
      });
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }
  });

  // 5. Envio do Formulário de Agendamento -> Direto para WhatsApp
  const formAgendar = document.getElementById('form-agendar');
  if (formAgendar) {
    formAgendar.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const instrumento = document.getElementById('instrumento-select').value;
      const nivel = document.getElementById('nivel-select').value;
      const periodo = document.getElementById('periodo-select').value;

      const mensagem = `Olá, Instituto Musical Bravo! Gostaria de agendar uma aula experimental presencial em Tatuí.
*Nome:* ${nome}
*Instrumento:* ${instrumento}
*Nível atual:* ${nivel}
*Período preferido:* ${periodo}

Podemos verificar os horários disponíveis?`;

      const encodedMsg = encodeURIComponent(mensagem);
      const whatsappUrl = `https://wa.me/5515998123456?text=${encodedMsg}`;

      // Abre WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Fecha o modal
      const modal = document.getElementById('modal-agendar');
      if (modal) closeModal(modal);
    });
  }

  // 6. Smooth scroll para âncoras na página
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1 && !this.classList.contains('open-modal-btn')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});
