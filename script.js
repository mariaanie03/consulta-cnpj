/**
 * Função Principal: buscarCNPJ
 * Realiza a sanitização, validação e busca dos dados da empresa.
 */
function buscarCNPJ() {
    // 1. LIMPEZA DE DADOS (Regex)
    // Requisito: O usuário pode digitar com máscara. Removemos tudo que não for número (\D).
    const campoInput = document.getElementById('cnpjInput');
    const cnpjLimpo = campoInput.value.replace(/\D/g, '');
    const resultadoDiv = document.getElementById('resultado');

    // 2. VALIDAÇÃO
    // Requisito: Se vazio ou diferente de 14 dígitos, mostrar alert e parar execução (return).
    if (cnpjLimpo === "" || cnpjLimpo.length !== 14) {
        alert("ERRO: O CNPJ deve conter exatamente 14 números. \nExemplo: 27.865.757/0001-02");
        return; 
    }

    // Feedback visual de carregamento para o usuário
    resultadoDiv.innerHTML = '<p style="text-align: center; color: #666; font-weight: 500;">Consultando base de dados da Receita...</p>';

    // 3. A REQUISIÇÃO (FETCH)
    // Usamos a BrasilAPI que retorna o endereço completo e evita erros de bloqueio (CORS).
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json' // Requisito: Garante que a resposta venha em JSON
        }
    })
    .then(response => {
        // --- 4. ANALISANDO O CÓDIGO DE STATUS (Requisito da Atividade) ---
        console.log("Status da Resposta HTTP:", response.status);

        if (response.status === 200) {
            console.log("✅ Código 200: Sucesso!");
            return response.json(); // Passo: Converte o JSON em Objeto JS
        } 
        else if (response.status === 429) {
            throw new Error("Erro 429: Limite de consultas excedido. Aguarde um momento e tente novamente.");
        } 
        else if (response.status === 504) {
            throw new Error("Erro 504: O servidor demorou muito para responder (Timeout).");
        } 
        else {
            throw new Error("CNPJ não encontrado ou erro na comunicação com a API.");
        }
    })
    .then(data => {
        // --- 5. MANIPULANDO E EXTRAINDO DADOS (Requisito da Atividade) ---
        // Criamos um objeto organizado extraindo apenas os campos solicitados
        const empresaObjeto = {
            razao: data.razao_social,
            fantasia: data.nome_fantasia || "NOME FANTASIA NÃO REGISTRADO",
            logradouro: `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro}, ${data.numero}`,
            bairro: data.bairro,
            cidade: data.municipio,
            estado: data.uf,
            situacao: data.descricao_situacao_cadastral
        };

        // Exibição técnica no console (Opcional conforme atividade)
        console.table(empresaObjeto);

        // --- 6. EXIBIÇÃO NO DOM (Sucesso) ---
        // Injetando o HTML formatado com todos os campos exigidos
        injetarHTML(empresaObjeto);
    })
    .catch(error => {
        // --- AVISO DE ERRO AO USUÁRIO ---
        console.error("Falha na operação:", error.message);
        resultadoDiv.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px; border: 2px solid #fee2e2; border-radius: 10px; background: #fef2f2;">
                <strong>Erro na Consulta:</strong> <br> ${error.message}
            </div>
        `;
    });
}

/**
 * Função Auxiliar: injetarHTML
 * Responsável por criar a estrutura visual dos dados na página.
 */
function injetarHTML(emp) {
    const resultadoDiv = document.getElementById('resultado');
    
    // Construção da Ficha Cadastral detalhada
    resultadoDiv.innerHTML = `
        <div class="ficha-cadastral">
            <div class="badge-situacao">${emp.situacao}</div>
            
            <label class="label-info">Razão Social</label>
            <div class="valor-titulo">${emp.razao}</div>

            <label class="label-info">Nome Fantasia</label>
            <div class="valor-texto">${emp.fantasia}</div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">

            <div class="grid-layout">
                <div class="coluna">
                    <label class="label-info">Logradouro</label>
                    <div class="valor-texto">${emp.logradouro}</div>
                </div>
                <div class="coluna">
                    <label class="label-info">Bairro</label>
                    <div class="valor-texto">${emp.bairro}</div>
                </div>
                <div class="coluna">
                    <label class="label-info">Cidade / Estado</label>
                    <div class="valor-texto">${emp.cidade} - ${emp.estado}</div>
                </div>
            </div>
        </div>
    `;
}