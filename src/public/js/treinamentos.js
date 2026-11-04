/* ==========================================================================
   TalentFlow — treinamentos.js
   Integração do Frontend com a API CRUD (/api/treinamentos)
   Cadastro (POST), Consulta (GET), Edição (PUT), Exclusão (DELETE) e Filtros
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const modalTreinamento = document.getElementById("modalTreinamento");
  const formTreinamento = document.getElementById("formTreinamento");
  const modalTitulo = document.getElementById("modalTreinamentoTitulo");
  const modalSubtitulo = document.getElementById("modalTreinamentoSubtitulo");
  const btnSalvarTexto = document.getElementById("btnSalvarTexto");
  const btnSalvar = document.getElementById("btnSalvarTreinamento");
  const formAlertaErro = document.getElementById("formAlertaErro");

  const inputId = document.getElementById("treinamentoId");
  const inputTitulo = document.getElementById("inputTitulo");
  const inputInstrutor = document.getElementById("inputInstrutor");
  const inputData = document.getElementById("inputData");
  const inputCargaHoraria = document.getElementById("inputCargaHoraria");
  const inputDescricao = document.getElementById("inputDescricao");

  const modalExclusao = document.getElementById("modalExclusao");
  const exclusaoNome = document.getElementById("exclusaoNomeTreinamento");
  const exclusaoId = document.getElementById("exclusaoTreinamentoId");
  const btnConfirmarExclusao = document.getElementById("btnConfirmarExclusao");
  let redirecionarAposExclusao = null;

  function exibirErroFormulario(mensagem) {
    if (!formAlertaErro) return;
    formAlertaErro.textContent = mensagem;
    formAlertaErro.classList.remove("hidden");
  }

  function limparErroFormulario() {
    if (!formAlertaErro) return;
    formAlertaErro.textContent = "";
    formAlertaErro.classList.add("hidden");
  }

  function abrirModalCriar() {
    if (!modalTreinamento || !formTreinamento) return;
    formTreinamento.reset();
    limparErroFormulario();
    inputId.value = "";
    modalSubtitulo.textContent = "NOVO REGISTRO";
    modalTitulo.textContent = "Cadastrar Treinamento";
    btnSalvarTexto.textContent = "Cadastrar Treinamento";

    // Define data padrão como hoje caso esteja vazio
    if (!inputData.value) {
      inputData.value = new Date().toISOString().split("T")[0];
    }

    modalTreinamento.classList.add("open");
    modalTreinamento.setAttribute("aria-hidden", "false");
    setTimeout(() => inputTitulo.focus(), 100);
  }

  async function abrirModalEditar(id) {
    if (!modalTreinamento || !formTreinamento) return;
    limparErroFormulario();

    try {
      const resposta = await fetch(`/api/treinamentos/${id}`);
      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.sucesso) {
        window.TalentFlowUI.mostrarNotificacao(
          resultado.mensagem || "Não foi possível carregar os dados do treinamento.",
          "error"
        );
        return;
      }

      const t = resultado.dados;
      inputId.value = t.id;
      inputTitulo.value = t.titulo || "";
      inputInstrutor.value = t.instrutor || "";
      inputData.value = t.data ? new Date(t.data).toISOString().split("T")[0] : "";
      inputCargaHoraria.value = t.cargaHoraria || "";
      inputDescricao.value = t.descricao || "";

      modalSubtitulo.textContent = `EDITANDO REGISTRO #${t.id}`;
      modalTitulo.textContent = "Editar Treinamento";
      btnSalvarTexto.textContent = "Salvar Alterações";

      modalTreinamento.classList.add("open");
      modalTreinamento.setAttribute("aria-hidden", "false");
      setTimeout(() => inputTitulo.focus(), 100);
    } catch (erro) {
      console.error("Erro ao buscar treinamento para edição:", erro);
      window.TalentFlowUI.mostrarNotificacao("Erro de comunicação com o servidor.", "error");
    }
  }

  function fecharModalTreinamento() {
    if (!modalTreinamento) return;
    modalTreinamento.classList.remove("open");
    modalTreinamento.setAttribute("aria-hidden", "true");
    limparErroFormulario();
  }

  function abrirModalExcluir(id, titulo, redirectUrl = null) {
    if (!modalExclusao) return;
    exclusaoId.value = id;
    exclusaoNome.textContent = `"${titulo}"`;
    redirecionarAposExclusao = redirectUrl;
    modalExclusao.classList.add("open");
    modalExclusao.setAttribute("aria-hidden", "false");
  }

  function fecharModalExclusao() {
    if (!modalExclusao) return;
    modalExclusao.classList.remove("open");
    modalExclusao.setAttribute("aria-hidden", "true");
    exclusaoId.value = "";
    redirecionarAposExclusao = null;
  }

  // Delegação de eventos para botões de abrir/fechar modais
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) {
      // Fechar modal clicando no backdrop escuro
      if (event.target === modalTreinamento) fecharModalTreinamento();
      if (event.target === modalExclusao) fecharModalExclusao();
      return;
    }

    const acao = btn.getAttribute("data-action");

    if (acao === "abrir-modal-criar") {
      abrirModalCriar();
    } else if (acao === "abrir-modal-editar") {
      const id = btn.getAttribute("data-id");
      if (id) abrirModalEditar(id);
    } else if (acao === "fechar-modal-treinamento") {
      fecharModalTreinamento();
    } else if (acao === "abrir-modal-excluir") {
      const id = btn.getAttribute("data-id");
      const titulo = btn.getAttribute("data-titulo") || "selecionado";
      const redirectUrl = btn.getAttribute("data-redirect");
      if (id) abrirModalExcluir(id, titulo, redirectUrl);
    } else if (acao === "fechar-modal-exclusao") {
      fecharModalExclusao();
    }
  });

  // Fechar modais com a tecla ESC
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharModalTreinamento();
      fecharModalExclusao();
    }
  });

  // Submissão do formulário de Criação (POST) ou Edição (PUT)
  if (formTreinamento) {
    formTreinamento.addEventListener("submit", async (event) => {
      event.preventDefault();
      limparErroFormulario();

      const id = inputId.value.trim();
      const dados = {
        titulo: inputTitulo.value.trim(),
        instrutor: inputInstrutor.value.trim(),
        data: inputData.value,
        cargaHoraria: Number(inputCargaHoraria.value),
        descricao: inputDescricao.value.trim(),
      };

      // Validação rápida no cliente
      if (!dados.titulo || dados.titulo.length < 3) {
        exibirErroFormulario("Informe um título válido com pelo menos 3 caracteres.");
        inputTitulo.focus();
        return;
      }
      if (!dados.instrutor || dados.instrutor.length < 2) {
        exibirErroFormulario("Informe o nome do(a) instrutor(a) responsável.");
        inputInstrutor.focus();
        return;
      }
      if (!dados.data) {
        exibirErroFormulario("Selecione a data de realização do treinamento.");
        inputData.focus();
        return;
      }
      if (!dados.cargaHoraria || dados.cargaHoraria <= 0) {
        exibirErroFormulario("A carga horária deve ser um número maior que zero.");
        inputCargaHoraria.focus();
        return;
      }

      const editando = Boolean(id);
      const url = editando ? `/api/treinamentos/${id}` : "/api/treinamentos";
      const metodo = editando ? "PUT" : "POST";

      btnSalvar.disabled = true;
      const textoOriginal = btnSalvarTexto.textContent;
      btnSalvarTexto.textContent = "Salvando...";

      try {
        const resposta = await fetch(url, {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
          exibirErroFormulario(resultado.mensagem || "Erro ao salvar o treinamento.");
          btnSalvar.disabled = false;
          btnSalvarTexto.textContent = textoOriginal;
          return;
        }

        window.TalentFlowUI.agendarNotificacao(
          resultado.mensagem ||
            (editando
              ? "Treinamento atualizado com sucesso!"
              : "Treinamento cadastrado com sucesso!"),
          "success"
        );
        fecharModalTreinamento();
        window.location.reload();
      } catch (erro) {
        console.error("Erro na requisição de salvamento:", erro);
        exibirErroFormulario("Falha de conexão com o servidor. Tente novamente.");
        btnSalvar.disabled = false;
        btnSalvarTexto.textContent = textoOriginal;
      }
    });
  }

  // Confirmação de Exclusão (DELETE)
  if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener("click", async () => {
      const id = exclusaoId.value;
      if (!id) return;

      btnConfirmarExclusao.disabled = true;
      const textoOriginal = btnConfirmarExclusao.textContent;
      btnConfirmarExclusao.textContent = "Excluindo...";

      try {
        const resposta = await fetch(`/api/treinamentos/${id}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
          window.TalentFlowUI.mostrarNotificacao(
            resultado.mensagem || "Não foi possível excluir o treinamento.",
            "error"
          );
          btnConfirmarExclusao.disabled = false;
          btnConfirmarExclusao.textContent = textoOriginal;
          fecharModalExclusao();
          return;
        }

        window.TalentFlowUI.agendarNotificacao(
          resultado.mensagem || "Treinamento excluído com sucesso!",
          "success"
        );

        if (redirecionarAposExclusao) {
          window.location.href = redirecionarAposExclusao;
        } else {
          window.location.reload();
        }
      } catch (erro) {
        console.error("Erro ao excluir treinamento:", erro);
        window.TalentFlowUI.mostrarNotificacao("Erro de comunicação ao excluir.", "error");
        btnConfirmarExclusao.disabled = false;
        btnConfirmarExclusao.textContent = textoOriginal;
      }
    });
  }

  // Submissão automática ao trocar os selects de filtro na página de Treinamentos
  const formFiltros = document.getElementById("formFiltros");
  const selectStatus = document.getElementById("selectStatus");
  const selectOrdenar = document.getElementById("selectOrdenar");

  if (formFiltros && selectStatus) {
    selectStatus.addEventListener("change", () => formFiltros.submit());
  }
  if (formFiltros && selectOrdenar) {
    selectOrdenar.addEventListener("change", () => formFiltros.submit());
  }
});
