import BSTree from "../classes/DataStructures/BSTree"


// TODO: Incluir asserts para verificar o funcionamento da árvore

// var assert = require('assert');
var DST = new BSTree();

DST.insert(21);
DST.insert(70);
DST.insert(8);
DST.insert(90);
DST.insert(33);
DST.insert(88);
DST.insert(13);
DST.insert(1);
DST.insert(9);
DST.insert(6);

var root = DST.getRootLeaf();

DST.inorder(root); // 1 6 8 9 13 21 33 70 88 90
DST.remove(1); // Removendo folha sem filhos

var root = DST.getRootLeaf();

DST.inorder(root); // 6 8 9 13 21 33 70 88 90
DST.remove(90); // Removendo folha com um filho

var root = DST.getRootLeaf();

DST.inorder(root); // 6 8 9 13 21 33 70 88
DST.remove(21); // Removendo folha com dois filhos

var root = DST.getRootLeaf();
console.log("inorder");
DST.inorder(root); // 6 8 9 13 33 70 88
console.log("postorder");
DST.postorder(root); // 6 9 13 8 88 70 33
console.log("preorder");
DST.preorder(root); // 33 8 6 13 9 70 88