import path from 'node:path';

export interface RunCliOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface NormalizeOptions {
  normalizeDurations?: boolean;
  normalizePaths?: boolean;
  removeAnsiCodes?: boolean;
  sortSections?: boolean;
  normalizeDates?: boolean;
}

export interface CliOutput {
  stdout: string;
  stderr: string;
  combined: string;
  exitCode: number;
}

/**
 * Exécute une commande CLI et retourne la sortie
 */
export async function runCliCommand(
  args: string[],
  options: RunCliOptions = {},
): Promise<CliOutput> {
  const cliPath = path.resolve(process.cwd(), 'src/index.ts');
  const { cwd = process.cwd(), env = {}, timeout = 60000 } = options;

  const proc = Bun.spawn({
    cmd: [process.execPath, 'run', cliPath, ...args],
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      ...env,
      // Désactiver les couleurs pour des snapshots cohérents
      NO_COLOR: '1',
      FORCE_COLOR: '0',
    },
  });

  // Créer un timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`CLI timeout after ${timeout}ms`)),
      timeout,
    );
  });

  // Attendre la sortie ou le timeout
  const [stdout, stderr] = await Promise.race([
    Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]),
    timeoutPromise,
  ]);

  await proc.exited;

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    combined: (stdout + stderr).trim(),
    exitCode: proc.exitCode || 0,
  };
}

/**
 * Normalise une sortie pour des snapshots stables
 */
export function normalizeOutput(
  output: string,
  options: NormalizeOptions = {},
): string {
  const {
    normalizeDurations = true,
    normalizePaths = true,
    removeAnsiCodes = true,
    sortSections = false,
    normalizeDates = true,
  } = options;

  let normalized = output;

  // Remplacer les durées variables
  if (normalizeDurations) {
    normalized = normalized.replace(/\d+\.\d+\s+secondes?/g, 'X.XX secondes');
    normalized = normalized.replace(/\d+\s+ms/g, 'X ms');
  }

  // Supprimer les codes couleur ANSI
  if (removeAnsiCodes) {
    // eslint-disable-next-line no-control-regex
    normalized = normalized.replace(/\x1b\[[0-9;]*m/g, '');
  }

  // Normaliser les chemins Windows → Unix
  if (normalizePaths) {
    normalized = normalized.replace(/react-demo\\+/g, 'react-demo/');
    normalized = normalized.replace(/\\+/g, '/');
  }

  // Normaliser les dates
  if (normalizeDates) {
    // Format : "Généré le: 2025-01-15 14:30:45"
    normalized = normalized.replace(
      /Généré le:\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g,
      'Généré le: YYYY-MM-DD HH:MM:SS',
    );
  }

  // Trier les sections alphabétiquement
  if (sortSections) {
    normalized = sortOutputSections(normalized);
  }

  return normalized;
}

/**
 * Trie les sections d'une sortie alphabétiquement
 */
function sortOutputSections(output: string): string {
  // Séparer le contenu des sections et le récapitulatif final
  const summaryStartIndex = output.indexOf('📊 Code mort détecté:');
  let sectionsContent = output;
  let summaryContent = '';

  if (summaryStartIndex !== -1) {
    sectionsContent = output.substring(0, summaryStartIndex).trim();
    summaryContent = output.substring(summaryStartIndex).trim();
  }

  // Séparer et trier les sections
  const sectionRegex = /===\s+([^=]+)\s+===/g;
  const sections: Array<{ title: string; content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = sectionRegex.exec(sectionsContent)) !== null) {
    if (lastIndex > 0 && sections.length > 0) {
      // Récupérer le contenu de la section précédente
      const prevContent = sectionsContent
        .substring(lastIndex, match.index)
        .trim();
      sections[sections.length - 1].content = prevContent;
    }
    sections.push({ title: match[1].trim(), content: '' });
    lastIndex = sectionRegex.lastIndex;
  }

  // Traiter la dernière section
  if (sections.length > 0 && lastIndex < sectionsContent.length) {
    sections[sections.length - 1].content = sectionsContent
      .substring(lastIndex)
      .trim();
  }

  // Trier les sections alphabétiquement par titre
  sections.sort((a, b) => a.title.localeCompare(b.title));

  // Trier le contenu de chaque section
  const sortedSections = sections.map((section) => {
    const lines = section.content.split('\n');
    const entries: string[][] = [];
    let currentEntry: string[] = [];

    // Regrouper les lignes qui forment une entrée
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('File:') || trimmed.startsWith('Suggestion:')) {
        if (currentEntry.length > 0) {
          entries.push(currentEntry);
        }
        currentEntry = [line];
      } else if (trimmed.length > 0) {
        currentEntry.push(line);
      }
    }
    if (currentEntry.length > 0) {
      entries.push(currentEntry);
    }

    // Trier les entrées par la première ligne
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    // Reconstruire le contenu trié
    return {
      title: section.title,
      content: entries.map((entry) => entry.join('\n')).join('\n'),
    };
  });

  // Reconstruire la sortie avec les sections triées
  const sortedOutput = sortedSections
    .map((section) => `=== ${section.title} ===\n${section.content}`)
    .join('\n\n\n');

  // Ajouter le récapitulatif final s'il existe
  return summaryContent
    ? `${sortedOutput}\n\n\n${summaryContent}`
    : sortedOutput;
}

/**
 * Helper all-in-one pour tester une commande CLI avec snapshot
 */
export async function runAndNormalizeCliOutput(
  args: string[],
  runOptions: RunCliOptions = {},
  normalizeOptions: NormalizeOptions = {},
): Promise<string> {
  const output = await runCliCommand(args, runOptions);
  return normalizeOutput(output.combined, normalizeOptions);
}
