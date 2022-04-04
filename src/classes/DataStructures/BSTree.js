// Nós/Folhas da Árvore de Busca
class Leaf {
    constructor(value) {
        this.value = value
        this.left = null
        this.right = null
    }
}

export default class BSTree {
    constructor() {
        this.root = null
    }

    // Insere um novo Nó/Folha na árvore com o valor do dado
    insert(data) {
        // Cria uma instância de nó com o valor do dado
        var newLeaf = new Leaf(data);

        // Se o nó raiz estiver vazio, então o nó raiz é o nó criado
        if (this.root === null)
            this.root = newLeaf;

        // Senão, encontra a posição correta para inserir o nó
        else
            this.insertLeaf(this.root, newLeaf);
    }

    // Método que percorre a árvore, buscando a posição correta para inserir o nó
    insertLeaf(leaf, newLeaf) {

        // Se o novo valor é menor que o valor da folha, então o novo valor é inserido na subárvore esquerda
        if (newLeaf.data < leaf.data) {
            // Se a folha esquerda estiver vazia, então o novo valor é inserido
            if (leaf.left === null)
                leaf.left = newLeaf;

            // senão, continua percorrendo a subárvore esquerda
            else
                this.insertLeaf(leaf.left, newLeaf);
        }

        // Se o novo valor é maior que o valor da folha, então o novo valor é inserido na subárvore direita
        else {
            // Se a folha direita estiver vazia, então o novo valor é inserido
            if (leaf.right === null)
                leaf.right = newLeaf;

            // senão, continua percorrendo a subárvore direita
            else
                this.insertLeaf(leaf.right, newLeaf);
        }
    }

    // Remove uma folha com o valor desejado
    remove(data) {
        // Raíz da árvore é modificada para remover a folha
        this.root = this.removeLeaf(this.root, data);
    }

    // Percorre a árvore, buscando o valor desejado para remover a folha
    removeLeaf(leaf, key) {

        // Se for vazio, então não há nada para remover
        if (leaf === null)
            return null;

        // Se o valor da folha é menor que o valor desejado, então percorre a subárvore esquerda buscando o valor desejado
        else if (key < leaf.data) {
            leaf.left = this.removeLeaf(leaf.left, key);
            return leaf;
        }

        // Se o valor da folha é maior que o valor desejado, então percorre a subárvore direita buscando o valor desejado
        else if (key > leaf.data) {
            leaf.right = this.removeLeaf(leaf.right, key);
            return leaf;
        }

        // Se o valor da folha é igual ao valor desejado, então a folha deve ser removida
        else {
            // Deletando uma folha sem filhos
            if (leaf.left === null && leaf.right === null) {
                leaf = null;
                return leaf;
            }

            // Deletando uma folha com um filho
            if (leaf.left === null) {
                leaf = leaf.right;
                return leaf;
            } else if (leaf.right === null) {
                leaf = leaf.left;
                return leaf;
            }

            // Deletando uma folha com dois filhos
            var aux = this.findMinLeaf(leaf.right);
            leaf.data = aux.data;

            leaf.right = this.removeLeaf(leaf.right, aux.data);
            return leaf;
        }

    }

    inorder(leaf) {
        if (leaf !== null) {
            this.inorder(leaf.left);
            console.log(leaf.data);
            this.inorder(leaf.right);
        }
    }

    preorder(leaf) {
        if (leaf !== null) {
            console.log(leaf.data);
            this.preorder(leaf.left);
            this.preorder(leaf.right);
        }
    }

    postorder(leaf) {
        if (leaf !== null) {
            this.postorder(leaf.left);
            this.postorder(leaf.right);
            console.log(leaf.data);
        }
    }

    // Busca o menor valor da subárvore
    findMinLeaf(leaf) {
        // Se a folha esquerda estiver vazia, então o valor é o da folha
        if (leaf.left === null)
            return leaf;
        else
            return this.findMinLeaf(leaf.left);
    }

    // Retorna o valor da raíz da árvore
    getRootLeaf() {
        return this.root;
    }

    // Busca por um determinado valor na árvore
    search(leaf, data) {
        // Se a folha for vazia, então não há nada para buscar
        if (leaf === null)
            return null;

        // Se o valor da folha é menor que o valor desejado, então percorre a subárvore esquerda buscando o valor desejado
        else if (data < leaf.data)
            return this.search(leaf.left, data);

        // Se o valor da folha é maior que o valor desejado, então percorre a subárvore direita buscando o valor desejado
        else if (data > leaf.data)
            return this.search(leaf.right, data);

        // Senão, o valor da folha é igual ao valor desejado
        else
            return leaf;
    }
}