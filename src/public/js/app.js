/* ==========================================================================
   TalentFlow — app.js
   Controle de Tema (Claro padrão / Escuro opcional), Navegação Ativa e Notificações
   ========================================================================== */

window.TalentFlowUI = {
  /**
   * Exibe uma notificação Toast no canto superior direito usando textContent (seguro contra XSS)
   * @param {string} mensagem
   * @param {'success' | 'error' | 'info'} tipo
   */
  mostrarNotificacao(mensagem, tipo = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;

    const span = document.createElement("span");
    span.textContent = mensagem;
    toast.appendChild(span);

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

  // 2. Alternância de Tema (Claro como padrão / Escuro opcional)
  const btnToggleTheme = document.getElementById("btnToggleTheme");

  function aplicarTema(tema) {
    const temaFinal = tema === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", temaFinal);
    try {
      localStorage.setItem("talentflow_theme", temaFinal);
    } catch {
      // Ignora erro de storage
    }
    if (btnToggleTheme) {
      btnToggleTheme.setAttribute(
        "title",
        temaFinal === "dark" ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"
      );
    }
  }

  const temaAtual = document.documentElement.getAttribute("data-theme") || "light";
  aplicarTema(temaAtual);

  if (btnToggleTheme) {
    btnToggleTheme.addEventListener("click", () => {
      const ativo = document.documentElement.getAttribute("data-theme") || "light";
      const proximo = ativo === "dark" ? "light" : "dark";
      aplicarTema(proximo);
    });
  }

  // 3. Sincronização do destaque ativo na barra de navegação (Início, Pessoas, Treinamentos, Agendados, Realizados)
  const navLinks = document.querySelectorAll(".pill-nav-links .pill-link");

  function definirLinkAtivo(chaveNav) {
    navLinks.forEach((link) => {
      if (link.getAttribute("data-nav") === chaveNav) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function sincronizarMenuPelaUrl() {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const hash = window.location.hash;

    if (pathname === "/" || pathname === "/dashboard") {
      if (hash === "#secao-pessoas") {
        definirLinkAtivo("pessoas");
      } else {
        definirLinkAtivo("inicio");
      }
      return;
    }

    if (pathname.startsWith("/treinamentos")) {
      if (status === "proximos") {
        definirLinkAtivo("agendados");
      } else if (status === "realizados") {
        definirLinkAtivo("realizados");
      } else {
        definirLinkAtivo("treinamentos");
      }
    }
  }

  // Atualiza ao carregar a página e quando o hash (#secao-pessoas) mudar
  sincronizarMenuPelaUrl();
  window.addEventListener("hashchange", sincronizarMenuPelaUrl);

  // Move a cor/destaque imediatamente quando o usuário clica em qualquer opção
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const chave = link.getAttribute("data-nav");
      if (chave) {
        definirLinkAtivo(chave);
      }

      // Se clicou em "Início" já estando na home com #secao-pessoas, limpa o hash e sobe a página
      if (chave === "inicio" && window.location.pathname === "/" && window.location.hash) {
        event.preventDefault();
        history.pushState("", document.title, window.location.pathname + window.location.search);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
});
