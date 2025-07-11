import { obterTipoDoValor } from './checadorTipos.js';

export class Vetor {
    /**
     * @param {string} tipoElemento O tipo dos elementos que este vetor vai guardar (ex: 'TIPO_INTEIRO')
     * @param {number[]} dimensoes Um array com os tamanhos de cada dimensão.
     */
    constructor(tipoElemento, dimensoes) {
        this.tipoElemento = tipoElemento; // <-- Guarda o tipo esperado
        this.dimensoes = dimensoes;
        this.valores = this._criarEstrutura(this.dimensoes);
    }

    _criarEstrutura(dims) {
        // ... (nenhuma mudança neste método) ...
        if (!dims || dims.length === 0) { return null; }
        const criar = (d) => {
            if (d.length === 1) { return new Array(d[0]).fill(null); }
            const t = d[0]; const s = d.slice(1);
            const a = new Array(t);
            for (let i = 0; i < t; i++) { a[i] = criar(s); }
            return a;
        };
        return criar(dims);
    }

    obter(indices) {
        // ... (nenhuma mudança neste método) ...
        let alvo = this.valores;
        for (let i = 0; i < indices.length; i++) {
            const indice = indices[i];
            if (!Array.isArray(alvo) || indice < 0 || indice >= alvo.length) {
                throw new Error(`Erro: Indice [${indice}] fora dos limites do vetor/matriz.`);
            }
            alvo = alvo[indice];
        }
        return alvo;
    }

    atribuir(indices, valor) {
        // CHECAGEM DE TIPO ADICIONADA!
        const tipoDoValor = obterTipoDoValor(valor);
        if (tipoDoValor !== this.tipoElemento && !(this.tipoElemento === 'TIPO_REAL' && tipoDoValor === 'TIPO_INTEIRO')) {
            throw new Error(`Erro de tipo: O vetor espera valores do tipo ${this.tipoElemento}, mas recebeu ${tipoDoValor}.`);
        }

        // O resto da lógica continua igual
        let alvo = this.valores;
        for (let i = 0; i < indices.length - 1; i++) {
            const indice = indices[i];
            if (!Array.isArray(alvo) || indice < 0 || indice >= alvo.length) {
                throw new Error(`Erro: Indice [${indice}] fora dos limites.`);
            }
            alvo = alvo[indice];
        }
        const ultimoIndice = indices[indices.length - 1];
        if (!Array.isArray(alvo) || ultimoIndice < 0 || ultimoIndice >= alvo.length) {
            throw new Error(`Erro: Indice final [${ultimoIndice}] fora dos limites.`);
        }
        alvo[ultimoIndice] = valor;
    }
}