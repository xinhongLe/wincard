import { lexer } from "./lexer";
import { parser } from "./parser";
import { format } from "./format";
import { toHTML } from "./stringify";
import type { AST } from "./types";

export const toAST = (str: string) => {
    const tokens = lexer(str);
    const nodes = parser(tokens);
    return format(nodes);
};

export { toHTML, AST };
