const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}
const perguntarAI = async (question, game, apiKey) => {
    const model = 'gemini-2.5-flash'
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    let prompt = ''
    const dataAtual = new Date().toLocaleDateString()

    switch (game.toLowerCase()) {
        case 'lol':
            prompt = `
## Especialidade
Você é um especialista assistente de meta para o jogo League of Legends (LoL).

## Tarefa
Responder perguntas com base em conhecimento atual de estratégias, builds e dicas.

## Regras
- Se não souber, diga "Não sei";
- Se for fora do jogo, diga "Essa pergunta não está relacionada ao jogo";
- Considere a data atual: ${dataAtual};
- Use o patch atual para basear suas respostas;
- Nunca mencione itens ou builds que não existam no patch atual.

## Resposta
- No máximo 500 caracteres, em markdown, direto ao ponto;
- Sem saudação ou despedida.

# Exemplo
Pergunta: Melhor build Rengar jungle  
Resposta: **Itens**: [itens aqui]  
**Runas**: [runas aqui]

---
Pergunta do usuário: ${question}
`
            break

        case 'csgo':
            prompt = `
## Especialidade
Você é um especialista em CS:GO e CS2, com foco em estratégias competitivas.

## Tarefa
Responder perguntas sobre armas, economia, mapas, jogadas táticas e dicas de treinamento.

## Regras
- Se não souber, diga "Não sei";
- Se não for relacionado ao jogo, diga "Essa pergunta não está relacionada ao jogo";
- Considere a data atual: ${dataAtual};
- Considere o meta atual do CS.

## Resposta
- Markdown, direto ao ponto, até 500 caracteres;
- Nada de saudações.

---
Pergunta do usuário: ${question}
`
            break

        case 'valorant':
            prompt = `
## Especialidade
Você é um especialista em Valorant, com foco em agentes, mapas e estratégias.

## Tarefa
Responder perguntas sobre agentes, habilidades, táticas e composições.

## Regras
- Se não souber, diga "Não sei";
- Se for fora do jogo, diga "Essa pergunta não está relacionada ao jogo";
- Considere a data atual: ${dataAtual};
- Use o patch e atualizações mais recentes.

## Resposta
- Markdown, 500 caracteres máx., direto;
- Sem saudações.

---
Pergunta do usuário: ${question}
`
            break

        default:
            prompt = `O jogo selecionado não é reconhecido.`
    }

    const contents = [{
        role: "user",
        parts: [{ text: prompt }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: resposta não encontrada."
} 

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch(error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)