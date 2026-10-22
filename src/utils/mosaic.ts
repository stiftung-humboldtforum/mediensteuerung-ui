import {
  Corner,
  MosaicDirection,
  MosaicNode,
  MosaicSplitNode,
  MosaicPath,
  isSplitNode,
  getLeaves,
  updateTree,
  getPathToCorner,
  getNodeAtPath,
  createRemoveUpdate,
} from 'react-mosaic-component'

const getOtherDirection = (direction: MosaicDirection): MosaicDirection => {
  if (direction === 'column') {
    return 'row'
  } else if (direction === 'row') {
    return 'column'
  } else {
    return window.innerWidth > window.innerHeight ? 'row' : 'column'
  }
}

// react-mosaic 7 replaced the binary first/second tree with an n-ary
// children[] tree (MosaicPath is now number[] of child indices). This walks
// down toward the largest tile by descending into the child that holds the
// most leaves at each split — the same "open next to the biggest window"
// intent as the old area heuristic, expressed for the n-ary model.
const getPathToLarger = (tree: MosaicNode<any>): MosaicPath => {
  const path: MosaicPath = []
  let currentNode: MosaicNode<any> = tree
  while (isSplitNode(currentNode)) {
    const split = currentNode as MosaicSplitNode<any>
    let bestIndex = 0
    let bestCount = -1
    split.children.forEach((child, index) => {
      const count = getLeaves(child).length
      if (count > bestCount) {
        bestCount = count
        bestIndex = index
      }
    })
    path.push(bestIndex)
    currentNode = split.children[bestIndex]
  }
  return path
}

const splitAtPath = (
  currentNode: MosaicNode<string>,
  path: MosaicPath,
  newNode: MosaicNode<string>,
): MosaicNode<string> => {
  const parent = getNodeAtPath(
    currentNode,
    // drop the last branch to address the parent node (was lodash dropRight)
    path.slice(0, -1),
  ) as MosaicNode<string> | null
  const destination = getNodeAtPath(currentNode, path) as MosaicNode<string>
  const direction: MosaicDirection =
    parent && isSplitNode(parent)
      ? getOtherDirection(parent.direction)
      : 'row'

  // preserve the original ordering: in a row the existing tile stays first
  // (left), in a column the new tile goes on top.
  const children: MosaicNode<string>[] =
    direction === 'row' ? [destination, newNode] : [newNode, destination]

  return updateTree(currentNode, [
    {
      path,
      spec: {
        $set: {
          type: 'split',
          direction,
          children,
        },
      },
    },
  ])
}

// A view taken out of the app (e.g. the floor plan, removed 2026-10) lingers in
// persisted layouts as a leaf nothing renders: an empty pane without title bar
// or drop target that cannot be closed. Drop every such leaf from the tree.
export const removeLeaf = (
  tree: MosaicNode<string> | null,
  id: string,
): MosaicNode<string> | null => {
  const find = (node: MosaicNode<string>, path: MosaicPath): MosaicPath | null => {
    if (!isSplitNode(node)) return node === id ? path : null
    for (let i = 0; i < node.children.length; i++) {
      const found = find(node.children[i], [...path, i])
      if (found) return found
    }
    return null
  }
  let current = tree
  // one removal per occurrence; bounded so a no-op update cannot loop forever
  for (let n = tree ? getLeaves(tree).length : 0; current && n > 0; n--) {
    const path = find(current, [])
    if (!path) break
    if (path.length === 0) return null
    current = updateTree(current, [createRemoveUpdate(current, path)])
  }
  return current
}

export const addToLargest = ({ currentNode, newNode }) => {
  if (currentNode) {
    if (getLeaves(currentNode).indexOf(newNode) !== -1) {
      return currentNode
    }
    if (window.innerWidth < 600) {
      return newNode
    }
    return splitAtPath(currentNode, getPathToLarger(currentNode), newNode)
  }
  return newNode
}

export const addToTopRight = ({ currentNode, newNode }) => {
  if (currentNode) {
    if (getLeaves(currentNode).indexOf(newNode) !== -1) {
      return currentNode
    }
    if (window.innerWidth < 600) {
      return newNode
    }
    return splitAtPath(
      currentNode,
      getPathToCorner(currentNode, Corner.TOP_RIGHT),
      newNode,
    )
  }
  return newNode
}
