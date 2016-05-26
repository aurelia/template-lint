"use strict";

import {SAXParser} from 'parse5';
import {Readable} from 'stream';

class Rule
{
    beforeParse(parser:SAXParser)
    {
    } 
    
    afterParse()
    {    
    }
} 

export class TemplateLint {
    constructor() {
    }
    
    hasSelfCloseTags(template: string):Promise<boolean>{       

        var parser: SAXParser = new SAXParser();    
        var stream: Readable = new Readable();

        stream.push(template);
        stream.push(null);

        var parser: SAXParser = new SAXParser();
        
        var hasSelfClose = false;
                                         
        parser.on('startTag', (name, attrs, selfClosing, location)=>{     
            hasSelfClose = hasSelfClose || selfClosing;                 
        });
                      
        var work = stream.pipe(parser);
            
        return new Promise<boolean>(function (resolve, reject) {
            work.on("end",()=>{resolve(hasSelfClose);});
        });  
    }
}