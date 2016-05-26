declare class Linter {
    private rules;
    constructor();
    lint(html: string): Promise<boolean>;
}
export { Linter };
