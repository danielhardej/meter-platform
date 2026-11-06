import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

export function createLanguageService(root = process.cwd()) {
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) throw new Error('Root tsconfig.json not found');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  if (parsed.errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(parsed.errors, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => '\n',
  }));

  const host = {
    getScriptFileNames: () => parsed.fileNames,
    getScriptVersion: () => '0',
    getScriptSnapshot: (file) => {
      const text = ts.sys.readFile(file);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => root,
    getCompilationSettings: () => parsed.options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    realpath: ts.sys.realpath,
  };
  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

export function findDeclaration(service, file, symbol) {
  const source = service.getProgram()?.getSourceFile(resolve(file));
  if (!source) throw new Error(`Source file not in the TypeScript program: ${file}`);
  const declaration = source.statements.find((statement) =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === symbol);
  if (!declaration?.name) throw new Error(`Function declaration not found: ${symbol}`);
  return { file: source.fileName, position: declaration.name.getStart(source) };
}

function compareSearch() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  if (!files.length) throw new Error('Stage the files first: this demo measures tracked files');
  const service = createLanguageService();
  const targets = [
    ['validateReading', 'packages/domain/src/validateReading.ts'],
    ['handlePayment', 'services/billing/src/handlePayment.ts'],
    ['calculateTariff', 'packages/domain/src/calculateTariff.ts'],
  ];
  const rows = targets.map(([symbol, file]) => {
    const textHits = files.reduce((total, tracked) =>
      total + readFileSync(tracked, 'utf8').split(symbol).length - 1, 0);
    const declaration = findDeclaration(service, file, symbol);
    const groups = service.findReferences(declaration.file, declaration.position) ?? [];
    const references = groups.flatMap((group) => group.references).filter((reference) => !reference.isDefinition);
    const unique = new Set(references.map((reference) => `${reference.fileName}:${reference.textSpan.start}`));
    return { Symbol: symbol, 'Text hits': textHits, 'TS references': unique.size };
  });
  console.table(rows);
  console.log('Text hits: substring occurrences in all tracked files, including names, prose and strings.');
  console.log('TS references: unique findReferences locations for the selected function, excluding definitions.');
  console.log('Imports and re-exports count as references; these are not just incoming calls.');
  service.dispose();
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) compareSearch();