import BSTree from "../classes/DataStructures/BSTree"

// TODO: consertar árvore nos comentários do teste, incluir asserts

var assert = require('assert');
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

//		  21
//		 / \
//	    8 70
//	   / \ / \
//	  90 13 33 6
//	  / \ /
//   1 9 88

var root = DST.getRootLeaf();

DST.inorder(root); // 1 6 8 9 13 21 33 70 88 90
DST.remove(1); // Removendo folha sem filhos


//		  21
//		 / \
//	    8   70
//	   / \  / \
//	  90 13 33 6
//	   \    /
//	   9   88


var root = DST.getRootLeaf();

DST.inorder(root); // 6 8 9 13 21 33 70 88 90
DST.remove(90); // Removendo folha com um filho

//		   21
//		  / \
//	     8   70
//	    / \  / \
//	   9 13 33 6
//		    /
//		   88


var root = DST.getRootLeaf();


DST.inorder(root); // 9 8 13 21 88 33 70 6
DST.remove(21); // Removendo folha com dois filhos

//		    88
//		  /   \
//	     8   70
//	    / \  / \
//	   9 13 33 6

var root = DST.getRootLeaf();
console.log("inorder"); // 9 8 13 88 33 70 6
DST.inorder(root);
console.log("postorder");
DST.postorder(root);
console.log("preorder");
DST.preorder(root);