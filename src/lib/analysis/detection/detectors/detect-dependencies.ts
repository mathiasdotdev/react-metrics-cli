/**
 * Détecteur de dépendances package.json
 */

import { Declaration, DeclarationType } from '$types/analysis';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Lit le contenu d'un fichier
 */
const readFileContent = async (filePath: string): Promise<string> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Impossible de lire le fichier ${filePath}: ${error}`);
  }
};

/**
 * Détecte les dépendances dans le package.json
 */
export const detectDependencies = async (
  projectPath: string,
): Promise<Declaration[]> => {
  const packageJsonPath = path.join(projectPath, 'package.json');

  try {
    const content = await readFileContent(packageJsonPath);
    const packageJson = JSON.parse(content);
    const declarations: Declaration[] = [];

    // Parcourir dependencies
    if (packageJson.dependencies) {
      const depsStart = content.indexOf('"dependencies"');
      if (depsStart !== -1) {
        for (const [depName, _version] of Object.entries(
          packageJson.dependencies,
        )) {
          // Trouver la ligne exacte de cette dépendance
          const depPattern = `"${depName}"`;
          const depIndex = content.indexOf(depPattern, depsStart);
          if (depIndex !== -1) {
            const beforeDep = content.substring(0, depIndex);
            const depLine = (beforeDep.match(/\n/g) || []).length + 1;

            declarations.push({
              name: depName,
              type: DeclarationType.DEPENDENCY,
              location: {
                filePath: packageJsonPath,
                line: depLine,
                column:
                  content.substring(beforeDep.lastIndexOf('\n') + 1, depIndex)
                    .length + 1,
              },
              isUsedLocally: false,
              isImportedExternally: false,
              context: 'dependency',
            });
          }
        }
      }
    }

    // Parcourir devDependencies
    if (packageJson.devDependencies) {
      const devDepsStart = content.indexOf('"devDependencies"');
      if (devDepsStart !== -1) {
        for (const [depName, _version] of Object.entries(
          packageJson.devDependencies,
        )) {
          const depPattern = `"${depName}"`;
          const depIndex = content.indexOf(depPattern, devDepsStart);
          if (depIndex !== -1) {
            const beforeDep = content.substring(0, depIndex);
            const depLine = (beforeDep.match(/\n/g) || []).length + 1;

            declarations.push({
              name: depName,
              type: DeclarationType.DEPENDENCY,
              location: {
                filePath: packageJsonPath,
                line: depLine,
                column:
                  content.substring(beforeDep.lastIndexOf('\n') + 1, depIndex)
                    .length + 1,
              },
              isUsedLocally: false,
              isImportedExternally: false,
              context: 'devDependency',
            });
          }
        }
      }
    }

    return declarations;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return [];
  }
};
