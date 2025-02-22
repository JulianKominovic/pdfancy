import { getCssSelector } from "css-selector-generator";
import { CssSelectorGeneratorOptionsInput } from "css-selector-generator/types/types.js";
export function getCssSelectorFromNode(
  node: Node | HTMLElement,
  baseNode?: Element | null
) {
  const cssSelectorSettings: CssSelectorGeneratorOptionsInput = {
    selectors: ["id", "attribute", "tag", "class", "nthchild", "nthoftype"],
    blacklist: [/.*style.*/],
    whitelist: [/.*data-page-number.*/],
    root: baseNode,
    includeTag: true,
  };
  return getCssSelector(node as Element, cssSelectorSettings);
}

export function getCssSelectorForTextNode(
  textNodeOrHTMLElement: Node | HTMLElement
) {
  if (textNodeOrHTMLElement instanceof HTMLElement) {
    return {
      cssSelectors: getCssSelectorFromNode(textNodeOrHTMLElement),
      childrenIndex: -1,
    };
  }
  const parentElement = textNodeOrHTMLElement.parentElement;

  return {
    cssSelectors: getCssSelectorFromNode(parentElement as HTMLElement),
    childrenIndex:
      textNodeOrHTMLElement.nodeName === "#text" && parentElement
        ? Array.from(parentElement.childNodes).findIndex((el) =>
            el.isSameNode(textNodeOrHTMLElement)
          )
        : -1,
  };
}

export function getElementFromCssSelectorAndChildrenIndex(
  rawCssSelector?: string,
  rawChildrenIndex?: number,
  baseNode = document
) {
  const childrenIndex = rawChildrenIndex === undefined ? -1 : rawChildrenIndex;
  const element = rawCssSelector
    ? baseNode.querySelector(rawCssSelector)
    : null;
  if (!element) return null;
  if (childrenIndex === -1) return element;
  return element.childNodes[childrenIndex] as HTMLElement;
}

export function recursiveFindChildrenIndex(node: Node, targetNode: Node) {
  if (node.isSameNode(targetNode)) return 0;
  if (node.childNodes.length === 0) return -1;

  const childIndex = Array.from(node.childNodes).findIndex((child) => {
    const result = recursiveFindChildrenIndex(child, targetNode);
    return result >= 0;
  });

  return childIndex >= 0 ? childIndex : -1;
}

export function recursiveFindNodeByCondition(
  node: Node,
  condition: (node: Node) => boolean
) {
  if (condition(node)) return node;
  if (node.parentNode)
    return recursiveFindNodeByCondition(node.parentNode, condition);
  return null;
}
