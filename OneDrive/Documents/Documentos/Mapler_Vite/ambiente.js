export class Ambiente {
  constructor() {
    this.valores = new Map();
    this.tipos = new Map(); // <-- NOVO: Mapa para guardar os tipos
  }

  // Agora, ao definir, guardamos o tipo da variável também
  definir(nome, tipoDado, valor = null) {
    this.valores.set(nome, valor);
    this.tipos.set(nome, tipoDado);
  }
  
  // A atribuição agora verifica o tipo antes de mudar o valor
  atribuir(tokenNome, valor) {
    const nome = tokenNome.lexema;
    if (this.valores.has(nome)) {
      const tipoEsperado = this.tipos.get(nome);
      const tipoDoValor = this._obterTipoDoValor(valor);

      // Checagem de tipo (simplificada)
      if (tipoEsperado === tipoDoValor || tipoEsperado === 'TIPO_REAL' && tipoDoValor === 'TIPO_INTEIRO') {
        this.valores.set(nome, valor);
        return valor;
      } else {
        throw new Error(`Erro de tipo: Impossivel atribuir um valor do tipo ${tipoDoValor} a uma variavel do tipo ${tipoEsperado}. (Linha: ${tokenNome.linha})`);
      }
    }
    throw new Error(`Erro em tempo de execucao: Variavel indefinida '${nome}'. (Linha: ${tokenNome.linha})`);
  }

  obter(tokenNome) {
    const nome = tokenNome.lexema;
    if (this.valores.has(nome)) {
      return this.valores.get(nome);
    }
    throw new Error(`Erro em tempo de execucao: Variavel indefinida '${nome}'. (Linha: ${tokenNome.linha})`);
  }

  /**
   * Função auxiliar para determinar o tipo de um valor JavaScript.
   * Inspirada no ChecadorTipoEstatico.java
   */
  _obterTipoDoValor(valor) {
    if (typeof valor === 'number') {
      return Number.isInteger(valor) ? 'TIPO_INTEIRO' : 'TIPO_REAL';
    }
    if (typeof valor === 'string') return 'TIPO_CADEIA';
    if (typeof valor === 'boolean') return 'TIPO_LOGICO';
    return null; // Para nulos ou outros tipos
  }
}