import { existsSync, readFileSync,  } from 'fs';
import { resolve, normalize } from 'path';
import * as glob from 'glob';
import * as rimraf from 'rimraf';
import * as ignore from 'ignore';
import { Logger } from './logger';
import { countReset } from 'console';

export class FuncIgnore {
    public static doesFuncignoreExist(working_dir: string): boolean {
        const funcignorePath: string = resolve(working_dir, '.funcignore');
        return existsSync(funcignorePath)
    }

    public static readFuncignore(working_dir: string): ignore.Ignore {
        const funcignorePath: string = resolve(working_dir, '.funcignore');
        const rules: string[] = readFileSync(funcignorePath).toString().split('\n').filter(l => l.trim() !== '');

        // checking if gitignore is in rules
        console.log(`if gitignore exist in rules: ${rules.indexOf('.gitignore') > -1}`);
        console.log(`index of gitignore in rules: ${rules.indexOf('.gitignore')}`);

        try {
            // @ts-ignore
            return ignore().add(rules);
        } catch (error) {
            Logger.Warn(`Failed to parse .funcignore: ${error}`);
        }
    }

    public static removeFilesFromFuncIgnore(working_dir: string, ignoreParser: ignore.Ignore): void {
        if (!ignoreParser) {
            Logger.Warn(`The ignore parser is undefined. Nothing will be removed.`);
            return;
        }

        const sanitizedWorkingDir: string = FuncIgnore.sanitizeWorkingDir(working_dir);
        const allFiles: string[] = glob.sync(`${sanitizedWorkingDir}/**/*`);

        allFiles.forEach(name => {
            const filename = name.replace(`${sanitizedWorkingDir}/`, '');
            if (ignoreParser.ignores(filename)) {

                // debug logs
                if (filename.indexOf(".gitignore") > -1) {
                    console.log(`in removeFiles: filename: ${filename}`);
                }

                try {
                    console.log(`start of try`);
                    if (name.indexOf(".gitignore") > -1) {
                        console.log(`in try: name: ${name}`);
                    }
                    rimraf.sync(name, { maxBusyTries: 1 });
                    console.log(`end of try`);
                } catch (error) {
                    if (filename.indexOf(".gitignore") > -1) {
                        console.log(`in catch: filename: ${filename}; error: ${error}`);
                    }

                    Logger.Warn(`Failed to remove ${filename} (file defined in .gitignore)`);
                }
            }
        })
    }

    private static sanitizeWorkingDir(working_dir: string): string {
        return normalize(resolve(working_dir)).replace(/\\/g, '/');
    }
}