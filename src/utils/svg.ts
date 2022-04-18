import { ISVGElementAttr, ISVGElementConfig } from "@/types/svg";

export const svgns = "http://www.w3.org/2000/svg";

export const transformPoint = (x: number, y: number, m: DOMMatrix) => {
    return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
};

export const assignAttributes = (node: Element, attrs: ISVGElementAttr) => {
    for (const key in attrs) {
        node.setAttribute(key, attrs[key].toString());
    }
};

export const removeChilds = (parent: HTMLElement) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

export const addSvgElement = (dom: HTMLElement, data: ISVGElementConfig) => {
    removeChilds(dom);
    let shape = dom.querySelector(`[id="${data.attr.id}"]`);
    if (shape) {
        dom.removeChild(shape);
        shape = null;
    }

    if (!shape) {
        shape = document.createElementNS(svgns, data.element);
        if (dom) {
            dom.appendChild(shape);
        }
        assignAttributes(shape, data.attr);
    }

    return shape;
};
