/* ReSpec supports markdown formatting, but this shows up on the page before being rendered
Hence we render the markdown to HTML ourselves, this gives us
complete control over formatting and syntax highlighting */

'use strict';

/**
 * @author Mike Ralphson <mike.ralphson@gmail.com>
 **/

const fs = require('fs');
const path = require('path');
const url = require('url');

const hljs = require('highlight.js');
hljs.registerLanguage('uritemplate', function() {
    return {
      case_insensitive: true,
      contains: [
          {
              scope: "attr", 
              match: /(?<=[{,])[^,}\n\r]+/,
          }
      ],
    }
  });
hljs.registerLanguage('uri', function() {
    return {
      case_insensitive: true,
      classNameAliases: {
          pathsegment: "attr",
          option: "attr",
          value: "literal"
      },
      contains: [
          {
              scope: "pathsegment", 
              match: /(?<=[/])[^/?#\n\r]+/,
          },
          {
              scope: "option", 
              match: /(?<=[?&#])[^=?&#\n\r]+/,
          },
          {
              scope: "value",
              match: /(?<=\=)[^?&#\n\r]+/,
          }
      ],
    }
  });
const cheerio = require('cheerio');

let argv = require('yargs')
    .string('maintainers')
    .alias('m','maintainers')
    .describe('maintainers','path to MAINTAINERS.md')
    .demandCommand(1)
    .argv;
const abstract = 'What is the OpenAPI Specification?';
let maintainers = [];
let emeritus = [];

const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
    return '<pre class="nohighlight" tabindex="0"><code>' +
      hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
      '</code></pre>';
    }

    if (lang) console.warn('highlight.js does not support language',lang);
    return '<pre class="nohighlight" tabindex="0"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

function preface(title,options) {
    const respec = {
        specStatus: "base",
        latestVersion: "https://spec.openapis.org/oas/latest.html",
        thisVersion: `https://spec.openapis.org/oas/v${options.subtitle}.html`,
        canonicalURI: `https://spec.openapis.org/oas/v${options.subtitle}.html`,
        editors: maintainers,
        formerEditors: emeritus,
        publishDate: options.publishDate,
        subtitle: 'Version '+options.subtitle,
        edDraftURI: "https://github.com/OAI/OpenAPI-Specification/",
        shortName: "OAS",
        historyURI: null, // prevent ReSpec from fetching a W3C history based on the shortName
        lint: false,
        logos:[{
            src: "https://raw.githubusercontent.com/OAI/OpenAPI-Style-Guide/master/graphics/bitmap/OpenAPI_Logo_Pantone.png",
            alt: "OpenAPI Initiative",
            height: 48,
            url: "https://openapis.org/"}],
        otherLinks: [
            {
                key: "Participate",
                data: [
                    {
                        value: "GitHub OAI/OpenAPI-Specification",
                        href: "https://github.com/OAI/OpenAPI-Specification/",
                    },
                    {
                        value: "File a bug",
                        href: "https://github.com/OAI/OpenAPI-Specification/issues",
                    },
                    {
                        value: "Commit history",
                        href: `https://github.com/OAI/OpenAPI-Specification/commits/main/versions/${options.subtitle}.md`,
                    },
                    {
                        value: "Pull requests",
                        href: "https://github.com/OAI/OpenAPI-Specification/pulls",
                    },
                ],
            },
        ],
        // localBiblio: {
        //     // add local bibliography entries here, add them to https://www.specref.org/, and remove them here once published
        // }
    };

    let preface = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${md.utils.escapeHtml(title)}</title>`;

    // SEO
    preface += '<meta name="description" content="The OpenAPI Specification (OAS) defines a standard, programming language-agnostic interface description for HTTP APIs.">';

    // ReSpec
    preface += '<meta name="color-scheme" content="light dark">';
    preface += '<script src="../js/respec-w3c.js" class="remove"></script>';
    preface += `<script class="remove">var respecConfig = ${JSON.stringify(respec)};</script>`;
    preface += fs.readFileSync(path.resolve(__dirname,'./analytics/google.html'),'utf8');
    preface += '</head><body>';
    preface += '<style>';
    preface += fs.readFileSync(path.resolve(__dirname,'main.css'),'utf8').split(/\r?\n/).join(' ');
    preface += fs.readFileSync(path.resolve(__dirname,'gist.css'),'utf8').split(/\r?\n/).join(' ');
    preface += '</style>';
    preface += `<h1 id="title">${title.split('|')[0]}</h1>`;
    preface += `<p class="copyright">Copyright © ${options.publishDate.getFullYear()} the Linux Foundation</p>`;
    preface += `<section class="notoc" id="abstract"><h2>${abstract}</h2>`;
    preface += 'The OpenAPI Specification (OAS) defines a standard, programming language-agnostic interface description for HTTP APIs, which allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code, additional documentation, or inspection of network traffic. When properly defined via OpenAPI, a consumer can understand and interact with the remote service with a minimal amount of implementation logic. Similar to what interface descriptions have done for lower-level programming, the OpenAPI Specification removes guesswork in calling a service.';
    preface += '</section>';
    preface += '<section class="override" id="sotd" data-max-toc="0">';
    preface += '<h2>Status of This Document</h2>';
    preface += 'The source-of-truth for this specification is the HTML file referenced above as <em>This version</em>.';
    preface += '</section>';

    return preface;
}

function doMaintainers() {
    let m = fs.readFileSync(argv.maintainers,'utf8');
    let h = md.render(m);
    let $ = cheerio.load(h);
    let u = $('ul').first();
    $(u).children('li').each(function(e){
        let t = $(this).text().split('@')[0];
        maintainers.push({name:t});
    });
    if ($("ul").length < 2) return;
    u = $("ul").last();
    $(u).children('li').each(function(e){
        let t = $(this).text().split('@')[0];
        emeritus.push({name:t});
    });
}

function getPublishDate(m) {
    let result = new Date();
    let h = md.render(m);
    let $ = cheerio.load(h);
    $('table').each(function(i,table){
        const h = $(table).find('th');
        const headers = [];
        $(h).each(function(i,header){
            headers.push($(header).text());
        });
        if (headers.length >= 2 && headers[0] === 'Version' && headers[1] === 'Date') {
            let c = $(table).find('tr').find('td');
            let v = $(c[0]).text();
            let d = $(c[1]).text();
            argv.subtitle = v;
            if (d !== 'TBA') result = new Date(d);
        }
    });
    return result;
}

if (argv.maintainers) {
    doMaintainers();
}

let s = fs.readFileSync(argv._[0],'utf8');

argv.publishDate = getPublishDate(s);

let lines = s.split(/\r?\n/);

let prevHeading = 0;
let inTOC = false;
let inDefs = false;
let inCodeBlock = false;
let indents = [0];

// process the markdown
for (let l in lines) {
    let line = lines[l];

    // remove TOC from older spec versions, respec will generate a new one
    if (line.startsWith('## Table of Contents')) inTOC = true;
    else if (line.startsWith('#')) inTOC = false;
    if (inTOC) line = '';

    // special formatting for Definitions section
    if (line.startsWith('## Definitions')) {
        inDefs = true;
    }
    else if (line.startsWith('## ')) inDefs = false;

    // recognize code blocks
    if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
    }

    if (line.indexOf('<a name="parameterAllowEmptyValue"/>')>=0) {
        // fix syntax error in 2.0.md
        line = line.replace('<a name="parameterAllowEmptyValue"/>','<span id="parameterAllowEmptyValue"></span>');
    }

    // replace deprecated <a name="..."></a> with <span id="..."></span> - needed for older specs
    line = line.replace(/<a name="([^"]+)"><\/a>/g,'<span id="$1"></span>');

    line = line.split('\\|').join('&#124;'); // was &brvbar

    if (!inCodeBlock) {

        // minor fixups to get RFC links to work properly
        line = line.replace('RFC [','[RFC');
        line = line.replace('[Authorization header as defined in ','Authorization header as defined in [');
        line = line.replace('[JSON Pointer]','JSON Pointer [RFC6901]'); // only in 2.0.md
        line = line.replace('[media type range](https://tools.ietf.org/html/rfc7231#appendix-D) ','media type range, see [RFC7231](https://tools.ietf.org/html/rfc7231#appendix-D), ');

        line = line.replace(/\[RFC ?([0-9]{1,5})\]\(/g,'[[RFC$1]](');

        // harmonize RFC URLs
        //TODO: harmonize to https://www.rfc-editor.org/rfc/rfc*
        line = line.replaceAll('](http://','](https://');
        line = line.replace('https://www.ietf.org/rfc/rfc2119.txt','https://tools.ietf.org/html/rfc2119'); // only in 2.0.md
        line = line.replace(/https:\/\/www.rfc-editor.org\/rfc\/rfc([0-9]{1,5})(\.html)?/g,'https://tools.ietf.org/html/rfc$1');
        line = line.replaceAll('https://datatracker.ietf.org/doc/html/','https://tools.ietf.org/html/');

        // handle url fragments in RFC links and construct section links as well as RFC links
        line = line.replace(/\]\]\(https:\/\/tools.ietf.org\/html\/rfc([0-9]{1,5})\/?(\#[^)]*)?\)/g, function(match, rfcNumber, fragment) {
            if (fragment) {
                // Extract section title from the fragment
                let sectionTitle = fragment.replace('#', '').replace(/-/g, ' ');
                sectionTitle = sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1); // Capitalize the first letter
                //TODO: section links to https://www.rfc-editor.org/rfc/rfc* for newer RFCs (>= 8700)
                return `]] [${sectionTitle}](https://datatracker.ietf.org/doc/html/rfc${rfcNumber}${fragment})`;
            } else {
                return ']]';
            }
        });

        // non-RFC references
        line = line.replace('[ABNF](https://tools.ietf.org/html/rfc5234)','[[ABNF]]');
        line = line.replace('[CommonMark 0.27](https://spec.commonmark.org/0.27/)','[[CommonMark-0.27]]');
        line = line.replace('[CommonMark syntax](https://spec.commonmark.org/)','[[CommonMark]] syntax');
        line = line.replace('CommonMark markdown formatting','[[CommonMark]] markdown formatting');
        line = line.replace('consult http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4)','consult [[HTML401]] [Section 17.13.4](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4)');
        line = line.replace('[IANA Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)','[[IANA-HTTP-STATUS-CODES|IANA Status Code Registry]]');
        line = line.replace('[IANA Authentication Scheme registry](https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml)','[[IANA-HTTP-AUTHSCHEMES]]');
        line = line.replace('[JSON Reference](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03)','[[JSON-Reference|JSON Reference]]');
        line = line.replace('[JSON Schema Specification Draft 4](https://json-schema.org/)','[[JSON-Schema-04|JSON Schema Specification Draft 4]]');
        line = line.replace('[JSON Schema Core](https://tools.ietf.org/html/draft-zyp-json-schema-04)','[[JSON-Schema-04|JSON Schema Core]]');
        line = line.replace('[JSON Schema Validation](https://tools.ietf.org/html/draft-fge-json-schema-validation-00)','[[JSON-Schema-Validation-04|JSON Schema Validation]]');
        line = line.replace('[JSON Schema Specification Wright Draft 00](https://json-schema.org/)','[[JSON-Schema-05|JSON Schema Specification Wright Draft 00]]');
        line = line.replace('[JSON Schema Core](https://tools.ietf.org/html/draft-wright-json-schema-00)','[[JSON-Schema-05|JSON Schema Core]]');
        line = line.replace('[JSON Schema Validation](https://tools.ietf.org/html/draft-wright-json-schema-validation-00)','[[JSON-Schema-Validation-05|JSON Schema Validation]]');
        line = line.replace('[JSON Schema Specification Draft 2020-12](https://tools.ietf.org/html/draft-bhutton-json-schema-00)','[[JSON-Schema-2020-12|JSON Schema Specification Draft 2020-12]]');
        line = line.replace('[JSON Schema Core](https://tools.ietf.org/html/draft-bhutton-json-schema-00)','[[JSON-Schema-2020-12|JSON Schema Core]]');
        line = line.replace('[JSON Schema Validation](https://tools.ietf.org/html/draft-bhutton-json-schema-validation-00)','[[JSON-Schema-Validation-2020-12|JSON Schema Validation]]');
        line = line.replace('[SPDX](https://spdx.org/licenses/) license','[[SPDX-Licenses]]');
        line = line.replace('[XML namespaces](https://www.w3.org/TR/xml-names11/)','[[xml-names11|XML namespaces]]');
        line = line.replace('JSON standards. YAML,','[[RFC7159|JSON]] standards. [[YAML|YAML]],'); // 2.0.md only
        line = line.replace('JSON or YAML format.','[[RFC7159|JSON]] or [[YAML|YAML]] format.');
        line = line.replace(/YAML version \[1\.2\]\(https:\/\/(www\.)?yaml\.org\/spec\/1\.2\/spec\.html\)/,'[[YAML|YAML version 1.2]]');
    }

    // fix relative links (to examples)
    if (!inCodeBlock && line.indexOf('](../examples/') >= 0) {
        // links to examples go to learn site, links to yaml files go to wrapper html
        line = line.replace(/\(\.\.\/examples\/([^)]+)\)/g,function(match,group1){
            console.warn("example link",group1);
            group1 = group1.replace('.yaml','.html');
            return `(https://learn.openapis.org/examples/${group1})`;
          })
    } else if (!inCodeBlock && line.indexOf('](../') >= 0) {
        // links to other sibling files go to github
        const regExp = /\((\.\.[^)]+)\)/g;
        line = line.replace(regExp,function(match,group1){
          console.warn('relative link',group1);
          return '('+url.resolve('https://github.com/OAI/OpenAPI-Specification/tree/main/versions/foo',group1)+')';
        });
    }

    // fix indentation of headings
    // - make sure that each heading is at most one level deeper than the previous heading
    // - reduce heading level by one if we're in respec mode except for h1
    if (!inCodeBlock && line.startsWith('#')) {
        let indent = 0;
        while (line[indent] === '#') indent++;
        let originalIndent = indent;

        let prevIndent = indents[indents.length-1]; // peek
        let delta = indent-prevIndent;

        if (indent > 1) {
            indent--;
        }
        let newIndent = indent;

        let title = line.split('# ')[1];
        if (inDefs) title = '<dfn>'+title+'</dfn>';
        line = ('#'.repeat(newIndent)+' '+title);

        if (delta>0) indents.push(originalIndent);
        if (delta<0) {
            let d = Math.abs(delta);
            while (d>0) {
                indents.pop();
                d--;
            }
        }
    }

    // wrap section text in <section>...</section> tags for respec
    if (!inCodeBlock && line.startsWith('#')) {
        let heading = 0;
        while (line[heading] === '#') heading++;
        let delta = heading-prevHeading;
        if (delta>1) console.warn(delta,line);
        if (delta>0) delta = 1;
        let prefix = '';
        let newSection = '<section>';
        const m = line.match(/# Version ([0-9.]+)$/);
        if (m) {
            // our conformance section is headlined with 'Version x.y.z'
            // and respec needs a conformance section in a "formal" specification
            newSection = '<section class="override" id="conformance">';
            // adjust the heading to be at level 2 because respec insists on h2 here
            // Note: older specs had this at h4, newer specs at h2, and all heading levels have been reduced by 1 in the preceding block
            line = '#' + m[0];
            delta = 1;
            heading = 2;
        }
        if (line.includes('Appendix')) {
            newSection = '<section class="appendix">';
        }

        // heading level delta is either 0 or is +1/-1, or we're in respec mode
        // respec insists on <section>...</section> breaks around headings

        if (delta === 0) {
            prefix = '</section>'+newSection;
        }
        else if (delta > 0) {
            prefix = newSection.repeat(delta);
        }
        else {
            prefix = '</section>'+('</section>').repeat(Math.abs(delta))+newSection;
        }
        prevHeading = heading;
        line = prefix+md.render(line);
    }

    lines[l] = line;
}

s = preface(`OpenAPI Specification v${argv.subtitle} | Introduction, Definitions, & More`,argv)+'\n\n'+lines.join('\n');
let out = md.render(s);
out = out.replace(/\[([RGB])\]/g,'&#91;$1&#93;');
out = out.replace('[[IANA-HTTP-AUTHSCHEMES]]','[[IANA-HTTP-AUTHSCHEMES|IANA Authentication Scheme registry]]');
console.log(out);
