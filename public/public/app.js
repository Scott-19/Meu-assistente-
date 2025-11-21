// app.js - MVP Completo
class FinancialAssistant {
    constructor() {
        this.transacoes = this.carregarDados();
        this.atualizarInterface();
    }

    adicionarTransacao(tipo, valor, descricao, categoria) {
        if (!valor || !descricao) {
            this.mostrarAlerta('Preencha todos os campos!', 'error');
            return;
        }

        const transacao = {
            id: Date.now(),
            tipo,
            valor: parseFloat(valor),
            descricao,
            categoria: categoria || 'outros',
            data: new Date().toLocaleDateString('pt-BR'),
            timestamp: new Date().getTime()
        };

        this.transacoes.unshift(transacao);
        this.salvarDados();
        this.atualizarInterface();
        this.mostrarAlerta('Transação adicionada com sucesso!', 'success');
    }

    calcularTotais() {
        const receitas = this.transacoes
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);
        
        const despesas = this.transacoes
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);
        
        return {
            saldo: receitas - despesas,
            receitas,
            despesas
        };
    }

    async perguntarAssistente(pergunta) {
        if (!pergunta.trim()) {
            this.mostrarAlerta('Digite uma pergunta!', 'error');
            return;
        }

        const respostaElement = document.getElementById('resposta');
        respostaElement.textContent = '🤔 Pensando...';
        respostaElement.classList.add('show');

        // Simulação de resposta do assistente
        setTimeout(() => {
            const contexto = this.calcularTotais();
            const respostas = this.gerarRespostaInteligente(pergunta, contexto);
            respostaElement.textContent = respostas;
        }, 1500);
    }

    gerarRespostaInteligente(pergunta, contexto) {
        const perguntaLower = pergunta.toLowerCase();
        
        if (perguntaLower.includes('economizar') || perguntaLower.includes('gastar menos')) {
            return `💡 Com base nos seus dados: 
- Seu saldo atual é R$ ${contexto.saldo.toFixed(2)}
- Você gastou R$ ${contexto.despesas.toFixed(2)} este mês
- Sugiro criar um orçamento para controlar melhor seus gastos`;
            
        } else if (perguntaLower.includes('saldo') || perguntaLower.includes('como estou')) {
            return `📊 Seu panorama financeiro:
• Saldo atual: R$ ${contexto.saldo.toFixed(2)}
• Receitas totais: R$ ${contexto.receitas.toFixed(2)}
• Despesas totais: R$ ${contexto.despesas.toFixed(2)}
${contexto.saldo > 0 ? '✅ Seu saldo está positivo!' : '⚠️ Atenção ao seu saldo negativo!'}`;
            
        } else if (perguntaLower.includes('investir') || perguntaLower.includes('guardar')) {
            return `💰 Recomendações de investimento:
• Reserve 10-20% da sua renda para investimentos
• Comece com fundos conservadores se for iniciante
• Considere a renda fixa para segurança`;
            
        } else if (perguntaLower.includes('categoria') || perguntaLower.includes('gasto')) {
            const categorias = this.analisarCategorias();
            const maiorCategoria = categorias.reduce((prev, current) => 
                (prev.total > current.total) ? prev : current
            );
            
            return `📈 Análise por categorias:
${categorias.map(cat => `• ${cat.nome}: R$ ${cat.total.toFixed(2)}`).join('\n')}

💡 Maior gasto: ${maiorCategoria.nome} (R$ ${maiorCategoria.total.toFixed(2)})`;
            
        } else {
            return `🤖 Com base nas suas ${this.transacoes.length} transações:
• Saldo: R$ ${contexto.saldo.toFixed(2)}
• Receitas: R$ ${contexto.receitas.toFixed(2)}
• Despesas: R$ ${contexto.despesas.toFixed(2)}

Dica: Mantenha um registro detalhado para melhor controle!`;
        }
    }

    analisarCategorias() {
        const categorias = {};
        
        this.transacoes
            .filter(t => t.tipo === 'despesa')
            .forEach(transacao => {
                if (!categorias[transacao.categoria]) {
                    categorias[transacao.categoria] = 0;
                }
                categorias[transacao.categoria] += transacao.valor;
            });
        
        return Object.keys(categorias).map(nome => ({
            nome,
            total: categorias[nome]
        }));
    }

    exportarDados() {
        if (this.transacoes.length === 0) {
            this.mostrarAlerta('Nenhum dado para exportar!', 'error');
            return;
        }

        const csv = this.converterParaCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financas-${new Date().toLocaleDateString('pt-BR')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.mostrarAlerta('Dados exportados com sucesso!', 'success');
    }

    converterParaCSV() {
        const headers = ['Data,Descrição,Categoria,Tipo,Valor'];
        const rows = this.transacoes.map(t => 
            `"${t.data}","${t.descricao}","${t.categoria}","${t.tipo}",${t.valor.toFixed(2)}`
        );
        return headers.concat(rows).join('\n');
    }

    limparDados() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.transacoes = [];
            this.salvarDados();
            this.atualizarInterface();
            this.mostrarAlerta('Todos os dados foram limpos!', 'success');
        }
    }

    mostrarAlerta(mensagem, tipo) {
        // Implementação simples de alerta
        alert(`[${tipo === 'success' ? '✅' : '⚠️'}] ${mensagem}`);
    }

    salvarDados() {
        localStorage.setItem('financialAssistantData', JSON.stringify(this.transacoes));
    }

    carregarDados() {
        const dados = localStorage.getItem('financialAssistantData');
        return dados ? JSON.parse(dados) : [];
    }

    atualizarInterface() {
        const totais = this.calcularTotais();
        
        // Atualizar dashboard
        document.getElementById('saldo').textContent = `R$ ${totais.saldo.toFixed(2)}`;
        document.getElementById('total-receitas').textContent = `R$ ${totais.receitas.toFixed(2)}`;
        document.getElementById('total-despesas').textContent = `R$ ${totais.despesas.toFixed(2)}`;
        
        // Atualizar cores do saldo
        const saldoElement = document.getElementById('saldo');
        saldoElement.style.color = totais.saldo >= 0 ? 'var(--success)' : 'var(--danger)';
        
        // Atualizar lista de transações
        this.atualizarListaTransacoes();
    }

    atualizarListaTransacoes() {
        const lista = document.getElementById('lista-transacoes');
        
        if (this.transacoes.length === 0) {
            lista.innerHTML = '<p class="empty-state">Nenhuma transação cadastrada</p>';
            return;
        }

        lista.innerHTML = this.transacoes
            .slice(0, 10) // Mostrar apenas as 10 mais recentes
            .map(transacao => `
                <div class="transacao-item ${transacao.tipo}">
                    <div class="transacao-info">
                        <div class="transacao-descricao">${transacao.descricao}</div>
                        <div class="transacao-meta">
                            ${transacao.categoria} • ${transacao.data}
                        </div>
                    </div>
                    <div class="transacao-valor">
                        ${transacao.tipo === 'receita' ? '+' : '-'} R$ ${transacao.valor.toFixed(2)}
                    </div>
                </div>
            `).join('');
    }
}

// Instanciar a aplicação
const app = new FinancialAssistant();

// Funções globais para o HTML
function adicionarTransacao() {
    const tipo = document.getElementById('tipo').value;
    const valor = document.getElementById('valor').value;
    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;

    app.adicionarTransacao(tipo, valor, descricao, categoria);
    
    // Limpar campos
    document.getElementById('valor').value = '';
    document.getElementById('descricao').value = '';
}

function perguntarAssistente() {
    const pergunta = document.getElementById('pergunta').value;
    app.perguntarAssistente(pergunta);
}

function exportarDados() {
    app.exportarDados();
}

function limparDados() {
    app.limparDados();
}

// Enter para adicionar transação
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('valor').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adicionarTransacao();
    });
    
    document.getElementById('descricao').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adicionarTransacao();
    });
    
    document.getElementById('pergunta').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') perguntarAssistente();
    });
});
