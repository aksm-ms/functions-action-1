"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuncIgnore = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const glob = require("glob");
const rimraf = require("rimraf");
const ignore = require("ignore");
const logger_1 = require("./logger");
class FuncIgnore {
    static doesFuncignoreExist(working_dir) {
        const funcignorePath = path_1.resolve(working_dir, '.funcignore');
        return fs_1.existsSync(funcignorePath);
    }
    static readFuncignore(working_dir) {
        const funcignorePath = path_1.resolve(working_dir, '.funcignore');
        const rules = fs_1.readFileSync(funcignorePath).toString().split('\n').filter(l => l.trim() !== '');
        // checking if gitignore is in rules
        console.log(`if gitignore exist in rules: ${rules.indexOf('.gitignore') > -1}`);
        console.log(`index of gitignore in rules: ${rules.indexOf('.gitignore')}`);
        try {
            // @ts-ignore
            return ignore().add(rules);
        }
        catch (error) {
            logger_1.Logger.Warn(`Failed to parse .funcignore: ${error}`);
        }
    }
    static removeFilesFromFuncIgnore(working_dir, ignoreParser) {
        if (!ignoreParser) {
            logger_1.Logger.Warn(`The ignore parser is undefined. Nothing will be removed.`);
            return;
        }
        const sanitizedWorkingDir = FuncIgnore.sanitizeWorkingDir(working_dir);
        const allFiles = glob.sync(`${sanitizedWorkingDir}/**/*`);
        // checking if gitignore is in allFiles
        console.log(`if gitignore exist in allFiles: ${allFiles.indexOf('.gitignore') > -1}`);
        console.log(`index of gitignore in allFiles: ${allFiles.indexOf('.gitignore')}`);
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
                }
                catch (error) {
                    if (filename.indexOf(".gitignore") > -1) {
                        console.log(`in catch: filename: ${filename}; error: ${error}`);
                    }
                    logger_1.Logger.Warn(`Failed to remove ${filename} (file defined in .gitignore)`);
                }
            }
        });
    }
    static sanitizeWorkingDir(working_dir) {
        return path_1.normalize(path_1.resolve(working_dir)).replace(/\\/g, '/');
    }
}
exports.FuncIgnore = FuncIgnore;
