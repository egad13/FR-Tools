/**
 * Created by Karl Miller, November 2021
 * 
 * github.com/klm127
 * 
 */

const TAG_NAME = "outerdocs";

const logger = require('jsdoc/util/logger')

function getLinkName(tagValue) {
    let firstDotIndex = tagValue.indexOf('.');
    if(firstDotIndex >= 0) {
        return tagValue.substr(0, firstDotIndex);
    }
    else {
        return tagValue;
    }
}

function getIdLink(tagValue) {
    let poundIndex = tagValue.indexOf('#');
    if(poundIndex < 0) {
        return {
            id: '',
            linkBase: tagValue
        }
    }
    else {
        return {
            linkBase: tagValue.substr(0, poundIndex),
            id: tagValue.substr(poundIndex)
        }
    }
}

exports.handlers = {
    parseBegin: function() { // spit an error if config isn't set up.
        let outerdocsConfig = env.conf[TAG_NAME];
        if(!outerdocsConfig) {
            logger.warn(`${TAG_NAME} is not defined in ${env.opts.configure}. Make ${TAG_NAME} a top level property or this plugin will have no effect. See Readme for more info.`);
        }
    }
}

exports.defineTags = function(dictionary,b) {
    dictionary.defineTag(TAG_NAME, {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            // get the outder docs config
            let config = env.conf[TAG_NAME];
            if(config) {
                let linkName = getLinkName(tag.value);
                let linkConfig = config[linkName];
                if(linkConfig) {
                    if(linkConfig.url) {
                        let appendHTML = "";
                        let workingValue = tag.value;
                        let idParse = getIdLink(workingValue)
                        workingValue = idParse.linkBase;

                        if(linkConfig.dropFirst) {
                            workingValue = workingValue.replace(linkName+".", "");
                            if(workingValue == linkName) {
                                workingValue = "";
                            }
                        }
                        else {
                            if(linkConfig.dropFirst != false) {
                                logger.warn(`dropFirst was not defined in ${env.opts.configure}: ${linkName}.dropFirst. Defaulting to false.`);
                            }

                        }

                        //dots or slashes
                        if(linkConfig.structure == "dots") {
                            appendHTML += workingValue;
                        }
                        else if(linkConfig.structure == "slashes"){
                            workingValue = workingValue.replaceAll('.','/')
                        }
                        else {
                            logger.warn(`structure was not defined in ${env.opts.configure}: ${linkName}.structure. Should be either "dots" or "slashes". Defaulting to "dots"`);
                            appendHTML += workingValue;
                        }

                        //append html or not
                        if(linkConfig.appendhtml) {
                            workingValue += ".html";
                        }
                        else {
                            if(linkConfig.appendhtml != false) {
                                logger.warn(`appending html was not defined in ${env.opts.configure}: ${linkName}.appendhtml. Defaulting to 'false'`);
                            }
                        }

                        
                        let fullURL = linkConfig.url + workingValue + idParse.id;
                        if(!doclet.see) {
                            doclet.see = [];
                        }
                        doclet.see.push(`{@link ${fullURL} ${tag.value}}`);
                    }
                    else {
                        logger.warn(`url was not defined in ${env.opts.configure}: ${linkName}.url. ${doclet.name} will not have external link.`);
                    }
                }
                else {
                    logger.warn(`${linkName} was not defined in the ${env.opts.configure} file. ${linkName} external links will not be added for ${doclet.name}`);
                }
            }
        }
    })
};
