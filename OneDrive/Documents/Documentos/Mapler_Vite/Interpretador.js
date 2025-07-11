// Arquivo: Interpretador.js (VERSÃO CORRIGIDA)
import { Vetor } from './vetor.js';
import { Ambiente } from './ambiente.js';
// Em Interpretador.js
import { obterTipoDoValor, converterInputString } from './checadorTipos.js'; // <-- importe a nova função
export class Interpretador {
  constructor(eventosService) {
    this.eventosService = eventosService;
    // O ambiente será criado a cada nova interpretação.
    this.ambiente = null; 
    this.resolverInput = null;
  }

  async interpretar(ast) {
    this.ambiente = new Ambiente();
    try {
      if (ast.tipo === "Modulo") {
        console.log("[Interpretador] Entrando no loop de execução...");
        for (const [index, comando] of ast.corpo.declaracoes.entries()) {
            console.log(`[Interpretador] Loop ${index}: Executando comando tipo '${comando.tipo}'...`);
            await this.executarDeclaracao(comando);
            console.log(`[Interpretador] Loop ${index}: Comando tipo '${comando.tipo}' finalizado.`);
        }
        console.log("[Interpretador] Fim do loop de execução.");
      } else {
        this.erro("AST inválida: tipo de raiz desconhecido");
      }
    } catch (erro) {
      this.erro(erro.message);
    }
  }

 

   async executarDeclaracao(declaracao) {
    if (!declaracao) return;
    switch (declaracao.tipo) {
      case "Ler": {
        console.log(`[Interpretador] Entrou no 'case "Ler"' para a variavel '${declaracao.variavel.lexema}'.`);
        
        // Passo 1: Cria a Promise e ARMAZENA a função para 'acordá-la' no 'this.resolverInput'.
        // Agora o "papel e a caneta" estão prontos.
        const promiseDoInput = new Promise((resolve) => {
            this.resolverInput = resolve;
        });

        // Passo 2: AGORA SIM, com tudo preparado, notifica a UI que estamos prontos para receber o input.
        // É o mesmo que gritar "Me ligue!".
        this.eventosService.notificar("INPUT_SOLICITADO");

        // Passo 3: Pausa a execução (await) e espera a UI chamar o this.resolverInput.
        console.log("[Interpretador] Pausando execucao e esperando a Promise...");
        const valorLido = await promiseDoInput;
        console.log(`[Interpretador] Promise resolvida! Valor lido: '${valorLido}'.`);

        const tipoVariavel = this.ambiente.tipos.get(declaracao.variavel.lexema);
        if (!tipoVariavel) {
            throw new Error(`Variavel '${declaracao.variavel.lexema}' nao foi declarada.`);
        }
        
        const valorConvertido = converterInputString(valorLido, tipoVariavel);
        console.log(`[Interpretador] Valor convertido para: '${valorConvertido}'. Atribuindo à variável...`);
        this.ambiente.atribuir(declaracao.variavel, valorConvertido);
        console.log("[Interpretador] Variavel atribuida com sucesso. Saindo do case 'Ler'.");
        break;
      }

      case "Escreva":
        const valores = declaracao.expressoes.map(expr => {
            const valorAvaliado = this.avaliarExpressao(expr);
            if (valorAvaliado === null) return "nulo";
            if (valorAvaliado === undefined) return "indefinido";
            // Adicionado para converter 'true' e 'false' para "verdadeiro" e "falso"
            if (typeof valorAvaliado === 'boolean') {
                return valorAvaliado ? 'verdadeiro' : 'falso';
            }
            return valorAvaliado;
        });
        const linhaCompleta = valores.join("");
        this.exibirSaida(linhaCompleta);
        break;

      case "Se":
        this.executarSe(declaracao);
        break;

      case "Bloco":
        for (const cmd of declaracao.declaracoes) {
          this.executarDeclaracao(cmd);
        }
        break;

      case "Enquanto":
        while (this.avaliarExpressao(declaracao.condicao)) {
          this.executarDeclaracao(declaracao.corpo);
        }
        break;

      case "Para":
        this.executarPara(declaracao);
        break;

      case "Repita":
        do {
          this.executarDeclaracao(declaracao.corpo);
        } while (!this.avaliarExpressao(declaracao.condicao));
        break;

      case "Ler": {
        this.eventosService.notificar("INPUT_SOLICITADO");
        
        const valorLido = await new Promise((resolve) => {
            this.resolverInput = resolve; 
        });

        // A lógica complexa de conversão foi movida!
        const tipoVariavel = this.ambiente.tipos.get(declaracao.variavel.lexema);
        if (!tipoVariavel) {
            throw new Error(`Variavel '${declaracao.variavel.lexema}' nao foi declarada.`);
        }
        
        // Apenas delegamos o trabalho para o checador de tipos
        const valorConvertido = converterInputString(valorLido, tipoVariavel);

        this.ambiente.atribuir(declaracao.variavel, valorConvertido);
        break;
      }

      default:
        // Para garantir que todos os outros comandos funcionem
        // Cole os outros cases aqui se você os removeu sem querer
        const cases = ["VarDeclaracoes", "Expressao", "Escreva", "Se", "Bloco", "Enquanto", "Para", "Repita"];
        if(cases.includes(declaracao.tipo)){
            // Simulação para os outros métodos que não são async
            // Esta parte é apenas para garantir que o resto funcione, o ideal é ter todos os cases aqui
            if(this[`executar${declaracao.tipo}`]){
                this[`executar${declaracao.tipo}`](declaracao);
            } else if (declaracao.tipo === "Expressao"){
                this.avaliarExpressao(declaracao.expressao)
            } else if (declaracao.tipo === "VarDeclaracoes"){
                for (const variavel of declaracao.variaveis) {
                    let valorInicial = null;
                    if (variavel.dimensoes && variavel.dimensoes.length > 0) {
                        valorInicial = new Vetor(variavel.tipoDado.tipo, variavel.dimensoes);
                    }
                    this.ambiente.definir(variavel.nome.lexema, variavel.tipoDado.tipo, valorInicial);
                }
            }
        } else {
             this.erro(`Declaração desconhecida: ${declaracao.tipo}`);
        }
    }
  }

  executarPara(decl) {
    this.avaliarExpressao(decl.inicializacao);
    while (this.avaliarExpressao(decl.condicao)) {
      this.executarDeclaracao(decl.corpo);
      this.avaliarExpressao(decl.incremento);
    }
  }
  
  executarSe(decl) {
    const condicao = this.avaliarExpressao(decl.condicao);
    const bloco = condicao ? decl.entao : decl.senao;
    if (bloco && bloco.declaracoes) {
      this.executarDeclaracao(bloco);
    }
  }

  avaliarExpressao(expr) {
    if (!expr) return null;

    switch (expr.tipo) {
      case "ExpParentizada":
        return this.avaliarExpressao(expr.grupo.expressao);

      case "Literal":
        return expr.valor;

      case "Variavel":
        return this.ambiente.obter(expr.nome);

       case "VariavelArray": {
        // Pega o objeto Vetor do ambiente
        const vetor = this.ambiente.obter(expr.nome);
        // Avalia os indices passados (ex: [1, 2])
        const indices = expr.indices.map(idx => this.avaliarExpressao(idx));
        // Delega a lógica de obter o valor para a própria classe Vetor
        return vetor.obter(indices);
      }

      case "Atribuicao":
        const valor = this.avaliarExpressao(expr.valor);
        this.ambiente.atribuir(expr.nome, valor);
        return valor;

     case "AtribuicaoArray": {
        const valorAtribuir = this.avaliarExpressao(expr.valor);
        // Pega o objeto Vetor do ambiente
        const vetor = this.ambiente.obter(expr.nome);
        // Avalia os indices
        const indices = expr.indices.map(idx => this.avaliarExpressao(idx));
        // Delega a lógica de atribuir para a própria classe Vetor
        vetor.atribuir(indices, valorAtribuir);
        return valorAtribuir;
      }

      case "Binario":
        const esquerda = this.avaliarExpressao(expr.esquerda);
        const direita = this.avaliarExpressao(expr.direita);
        return this.avaliarOperacaoBinaria(expr.operador.tipo, esquerda, direita);

      default:
        this.erro(`Expressão desconhecida: ${expr.tipo}`);
    }
  }
  
  avaliarOperacaoBinaria(operadorTipo, esquerda, direita) {
    switch (operadorTipo) {
      case "MAIS": return esquerda + direita;
      case "MENOS": return esquerda - direita;
      case "ASTERISCO": return esquerda * direita;
      case "BARRA": return esquerda / direita;
      // Usando igualdade estrita para evitar problemas
      case "IGUAL": return esquerda === direita;
      case "DIFERENTE": return esquerda !== direita;
      case "MAIOR_QUE": return esquerda > direita;
      case "MENOR_QUE": return esquerda < direita;
      case "MAIOR_IGUAL": return esquerda >= direita;
      case "MENOR_IGUAL": return esquerda <= direita;
      default:
        this.erro(`Operador binário não implementado: ${operadorTipo}`);
    }
  }

  exibirSaida(valor) {
    if (this.eventosService) {
      this.eventosService.notificar("ESCREVER", valor);
    } else {
      console.log(valor);
    }
  }

  erro(mensagem) {
    console.error("Erro de execução:", mensagem);
    if (this.eventosService) {
      this.eventosService.notificar("ERRO", mensagem);
    }
    throw new Error(mensagem);
  }
}