import BSTree from "../classes/DataStructures/BSTree"


// create an object for the BinarySearchTree
var DST = new BinarySearchTree();

// Inserting nodes to the BinarySearchTree
DST.insert(15);
DST.insert(25);
DST.insert(10);
DST.insert(7);
DST.insert(22);
DST.insert(17);
DST.insert(13);
DST.insert(5);
DST.insert(9);
DST.insert(27);

//		 15
//		 / \
//	 10 25
//	 / \ / \
//	 7 13 22 27
//	 / \ /
// 5 9 17

var root = DST.getRootLeaf();

// prints 5 7 9 10 13 15 17 22 25 27
DST.inorder(root);

// Removing leaf with no children
DST.remove(5);


//		 15
//		 / \
//	 10 25
//	 / \ / \
//	 7 13 22 27
//	 \ /
//	 9 17


var root = DST.getRootLeaf();

// prints 7 9 10 13 15 17 22 25 27
DST.inorder(root);

// Removing leaf with one child
DST.remove(7);

//		 15
//		 / \
//	 10 25
//	 / \ / \
//	 9 13 22 27
//		 /
//		 17


var root = DST.getRootLeaf();

// prints 9 10 13 15 17 22 25 27
DST.inorder(root);

// Removing leaf with two children
DST.remove(15);

//		 17
//		 / \
//	 10 25
//	 / \ / \
//	 9 13 22 27

var root = DST.getRootLeaf();
console.log("inorder traversal");

// prints 9 10 13 17 22 25 27
DST.inorder(root);

console.log("postorder traversal");
DST.postorder(root);
console.log("preorder traversal");
DST.preorder(root);