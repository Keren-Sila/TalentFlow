/* ==========================================================================
   TalentFlow — app.js
   Controle de Menu Mobile, Notificações (Toast) e Utilitários Globais de UI
   ========================================================================== */

window.TalentFlowUI = {
  /**
   * Exibe uma notificação Toast no canto superior direito
   * @param {string} mensagem
   * @param {'success' | 'error' | 'info'} tipo
   */
  mostrarNotificacao(mensagem, tipo = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
      <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  },

  /**
   * Salva uma notificação para ser exibida após recarregar ou redirecionar a página
   */
  agendarNotificacao(mensagem, tipo = "success") {
    sessionStorage.setItem("talentflow_toast", JSON.stringify({ mensagem, tipo }));
  },

  /**
   * Verifica se há notificação agendada no sessionStorage e a exibe
   */
  verificarNotificacaoAgendada() {
    const raw = sessionStorage.getItem("talentflow_toast");
    if (!raw) return;

    sessionStorage.removeItem("talentflow_toast");
    try {
      const { mensagem, tipo } = JSON.parse(raw);
      if (mensagem) {
        this.mostrarNotificacao(mensagem, tipo || "success");
      }
    } catch {
      // Ignora JSON inválido
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Verificar notificações após reload
  window.TalentFlowUI.verificarNotificacaoAgendada();

  // 2. Controle da Sidebar no Mobile
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const btnToggle = document.getElementById("btnToggleSidebar");
  const btnClose = document.getElementById("btnCloseSidebar");

  function abrirMenuMobile() {
    if (sidebar && overlay) {
      sidebar.classList.add("open");
      overlay.classList.add("active");
    }
  }

  function fecharMenuMobile() {
    if (sidebar && overlay) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    }
  }

  if (btnToggle) btnToggle.addEventListener("click", abrirMenuMobile);
  if (btnClose) btnClose.addEventListener("click", fecharMenuMobile);
  if (overlay) overlay.addEventListener("click", fecharMenuMobile);
});
