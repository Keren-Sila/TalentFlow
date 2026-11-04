/* ==========================================================================
   TalentFlow — treinamentos.js
   Integração do Frontend com a API CRUD (/api/treinamentos)
   Cadastro (POST), Consulta (GET), Edição (PUT), Exclusão (DELETE) e Filtros
   ========================================================================== */

/**
 * Retorna a data local (fuso do navegador) no formato YYYY-MM-DD
 * evitando que new Date().toISOString() avance para o dia seguinte após as 21h no Brasil.
 */
function obterDataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Extrai a parte YYYY-MM-DD de uma data vinda da API (armazenada em UTC)
 * de forma consistente com a gravação no MySQL.
 */
function formatarDataParaInput(valorData) {
  if (!valorData) return "";
  if (typeof valorData === "string") {
    const match = valorData.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(valorData);
  if (Number.isNaN(d.getTime())) return "";
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Valida se uma string YYYY-MM-DD representa uma data real do calendário
 */
function dataCalendarioValida(textoData) {
  if (!textoData || typeof textoData !== "string") return false;
  const match = textoData.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  if (ano < 2000 || ano > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

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
  let ultimoElementoFocado = null;

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

  function abrirModalCriar(elementoGatilho = null) {
    if (!modalTreinamento || !formTreinamento) return;
    ultimoElementoFocado = elementoGatilho || document.activeElement;
    formTreinamento.reset();
    limparErroFormulario();
    inputId.value = "";
    modalSubtitulo.textContent = "NOVO REGISTRO";
    modalTitulo.textContent = "Cadastrar Treinamento";
    btnSalvarTexto.textContent = "Cadastrar Treinamento";

    // Define data padrão usando a data local do Brasil (YYYY-MM-DD)
    if (!inputData.value) {
      inputData.value = obterDataLocalISO();
    }

    modalTreinamento.classList.add("open");
    modalTreinamento.setAttribute("aria-hidden", "false");
    setTimeout(() => inputTitulo.focus(), 100);
  }

  async function abrirModalEditar(id, elementoGatilho = null) {
    if (!modalTreinamento || !formTreinamento) return;
    ultimoElementoFocado = elementoGatilho || document.activeElement;
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
      inputData.value = formatarDataParaInput(t.data);
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
    if (ultimoElementoFocado && typeof ultimoElementoFocado.focus === "function") {
      ultimoElementoFocado.focus();
      ultimoElementoFocado = null;
    }
  }

  function abrirModalExcluir(id, titulo, redirectUrl = null, elementoGatilho = null) {
    if (!modalExclusao) return;
    ultimoElementoFocado = elementoGatilho || document.activeElement;
    exclusaoId.value = id;
    exclusaoNome.textContent = `"${titulo}"`;
    redirecionarAposExclusao = redirectUrl;
    modalExclusao.classList.add("open");
    modalExclusao.setAttribute("aria-hidden", "false");
    setTimeout(() => btnConfirmarExclusao && btnConfirmarExclusao.focus(), 100);
  }

  function fecharModalExclusao() {
    if (!modalExclusao) return;
    modalExclusao.classList.remove("open");
    modalExclusao.setAttribute("aria-hidden", "true");
    exclusaoId.value = "";
    redirecionarAposExclusao = null;
    if (ultimoElementoFocado && typeof ultimoElementoFocado.focus === "function") {
      ultimoElementoFocado.focus();
      ultimoElementoFocado = null;
    }
  }

  // Delegação de eventos para botões de abrir/fechar modais
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) {
      if (event.target === modalTreinamento) fecharModalTreinamento();
      if (event.target === modalExclusao) fecharModalExclusao();
      return;
    }

    const acao = btn.getAttribute("data-action");

    if (acao === "abrir-modal-criar") {
      abrirModalCriar(btn);
    } else if (acao === "abrir-modal-editar") {
      const id = btn.getAttribute("data-id");
      if (id) abrirModalEditar(id, btn);
    } else if (acao === "fechar-modal-treinamento") {
      fecharModalTreinamento();
    } else if (acao === "abrir-modal-excluir") {
      const id = btn.getAttribute("data-id");
      const titulo = btn.getAttribute("data-titulo") || "selecionado";
      const redirectUrl = btn.getAttribute("data-redirect");
      if (id) abrirModalExcluir(id, titulo, redirectUrl, btn);
    } else if (acao === "fechar-modal-exclusao") {
      fecharModalExclusao();
    }
  });

  // Fechar modais com a tecla ESC
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modalTreinamento && modalTreinamento.classList.contains("open")) {
        fecharModalTreinamento();
      }
      if (modalExclusao && modalExclusao.classList.contains("open")) {
        fecharModalExclusao();
      }
    }
  });

  // Submissão do formulário de Criação (POST) ou Edição (PUT)
  if (formTreinamento) {
    formTreinamento.addEventListener("submit", async (event) => {
      event.preventDefault();
      limparErroFormulario();

      const id = inputId.value.trim();
      const cargaNumero = Number(inputCargaHoraria.value);
      const dados = {
        titulo: inputTitulo.value.trim(),
        instrutor: inputInstrutor.value.trim(),
        data: inputData.value,
        cargaHoraria: cargaNumero,
        descricao: inputDescricao.value.trim(),
      };

      // Validação no cliente alinhada às regras do Controller
      if (!dados.titulo || dados.titulo.length < 3 || dados.titulo.length > 150) {
        exibirErroFormulario("O título deve ter entre 3 e 150 caracteres.");
        inputTitulo.focus();
        return;
      }
      if (!dados.instrutor || dados.instrutor.length < 2 || dados.instrutor.length > 120) {
        exibirErroFormulario("O nome do(a) instrutor(a) deve ter entre 2 e 120 caracteres.");
        inputInstrutor.focus();
        return;
      }
      if (!dataCalendarioValida(dados.data)) {
        exibirErroFormulario("Informe uma data de realização válida.");
        inputData.focus();
        return;
      }
      if (
        inputCargaHoraria.value === "" ||
        Number.isNaN(cargaNumero) ||
        !Number.isInteger(cargaNumero) ||
        cargaNumero <= 0 ||
        cargaNumero > 1000
      ) {
        exibirErroFormulario("A carga horária deve ser um número inteiro entre 1 e 1000 horas.");
        inputCargaHoraria.focus();
        return;
      }
      if (dados.descricao.length > 2000) {
        exibirErroFormulario("A descrição deve ter no máximo 2000 caracteres.");
        inputDescricao.focus();
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
