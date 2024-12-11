import fs from 'fs/promises';
import path from 'path';
import Markdoc from '@markdoc/markdoc';
import { execSync } from 'child_process';
import { title, description } from './constants.js';
import { decode } from 'html-entities';

function getNodeText(node: any): string {
  if (typeof node === 'string') return decode(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (typeof node === 'object' && node.children) return getNodeText(node.children);
  return '';
}

function sanitizeId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  try {
    // Read README.md and create out directory
    let source = await fs.readFile(path.join(process.cwd(), '..', 'attachments', 'README.md'), 'utf-8');
    const outDir = path.join(process.cwd(), 'out');
    await fs.mkdir(outDir, { recursive: true });

    // Parse markdown
    const ast = Markdoc.parse(source);

    const headings: Array<{ id: string; text: string; level: number }> = [];
    let tabGroupCounter = 0;

    // Custom config for transforming nodes
    const config = {
      nodes: {
        document: {
          transform(node: any, config: any) {
            const children = node.transformChildren(config);
            return children;
          }
        },
        heading: {
          transform(node: any, config: any) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            const text = getNodeText(children);
            const id = text ? sanitizeId(text) : '';
            const level = attributes.level || 1;

            if (level === 2 || level === 3) {
              headings.push({ id, text: decode(text), level });
            }

            return new Markdoc.Tag(
              `h${level}`,
              {
                id,
                class: `heading-${level}`,
                'data-heading': 'true'
              },
              children.map((child: any) => typeof child === 'string' ? decode(child) : child)
            );
          }
        },
        paragraph: {
          transform(node: any, config: any) {
            const children = node.transformChildren(config);
            const text = getNodeText(node);

            // If the content is HTML, parse it carefully
            if (text.includes('<') && text.includes('>')) {
              // Clean up the HTML content
              return text
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/<\/?p>/g, '') // Remove any p tags in the HTML content
                .trim();
            }

            // Regular paragraph content
            return new Markdoc.Tag('p', { class: 'mb-4' }, children);
          }
        },
        image: {
          transform(node: any, config: any) {
            const attributes = node.transformAttributes(config);
            const src = attributes.src || '';
            const alt = attributes.alt || '';
            const title = attributes.title;

            return new Markdoc.Tag('img', {
              src: src.startsWith('http') ? src : path.basename(src),
              alt: decode(alt),
              title: title ? decode(title) : undefined,
              class: 'inline-block'
            });
          }
        },
        link: {
          transform(node: any, config: any) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            const href = attributes.href || '';
            const title = attributes.title;

            // Handle different types of links
            let processedHref = '';
            if (href.startsWith('#')) {
              // Internal anchor links - keep as is
              processedHref = href;
            } else if (href.startsWith('http')) {
              // External links - keep as is
              processedHref = href;
            } else {
              // Convert relative links to anchors based on text content
              const text = getNodeText(children);
              processedHref = '#' + sanitizeId(text);
            }

            return new Markdoc.Tag('a', {
              href: processedHref,
              title: title ? decode(title) : undefined,
              class: 'text-blue-400 hover:text-blue-300 transition-colors duration-200'
            }, children.map((child: any) => typeof child === 'string' ? decode(child) : child));
          }
        },
        fence: {
          transform(node: any, config: any) {
            const { language } = node.attributes;
            const content = node.attributes.content;

            // Handle tab groups
            if (content.includes('===')) {
              tabGroupCounter++;
              const tabs: string[] = content.split('===').map((tab: string) => tab.trim());
              const tabTitles: string[] = tabs.map((tab: string) => tab.split('\n')[0]);
              const tabContents: string[] = tabs.map((tab: string) =>
                tab.split('\n')
                   .slice(1)
                   .join('\n')
                   .trim()
              );

              const tabsHtml = tabTitles.map((title: string, i: number) =>
                new Markdoc.Tag('button', {
                  class: `tab${i === 0 ? ' active' : ''}`,
                  'data-tab': i.toString(),
                  'data-group': tabGroupCounter.toString()
                }, [title])
              );

              const contentHtml = tabContents.map((content: string, i: number) =>
                new Markdoc.Tag('div', {
                  class: `tab-content${i === 0 ? ' active' : ''}`,
                  'data-tab': i.toString(),
                  'data-group': tabGroupCounter.toString()
                }, [
                  new Markdoc.Tag('pre', { tabindex: '0' }, [
                    new Markdoc.Tag('code', {
                      class: `language-${language || 'text'}`,
                      'data-prism': 'true'
                    }, [content])
                  ])
                ])
              );

              return new Markdoc.Tag('div', { class: 'tab-group' }, [
                new Markdoc.Tag('div', { class: 'tab-list' }, tabsHtml),
                new Markdoc.Tag('div', { class: 'tab-contents' }, contentHtml)
              ]);
            }

            // Regular code blocks
            return new Markdoc.Tag('pre', { tabindex: '0' }, [
              new Markdoc.Tag('code', {
                class: `language-${language || 'text'}`,
                'data-prism': 'true'
              }, [content])
            ]);
          }
        }
      }
    };

    // Transform content
    const content = Markdoc.transform(ast, config);
    let contentHtml = Markdoc.renderers.html(content);

    // Clean up HTML structure
    contentHtml = contentHtml
      // Handle HTML entities in non-code content
      .replace(/&quot;(?![^<]*<\/code>)/g, '"')
      .replace(/&lt;(?![^<]*<\/code>)/g, '<')
      .replace(/&gt;(?![^<]*<\/code>)/g, '>')
      .replace(/&amp;(?![^<]*<\/code>)/g, '&')
      // Clean up structure
      .replace(/(<p[^>]*>)\s*(<p[^>]*>)/g, '$1')
      .replace(/(<\/p>)\s*(<\/p>)/g, '$2')
      .replace(/<h([1-6])[^>]*>\s*<\/h\1>/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ');

    // Generate sidebar HTML
    const sidebarHtml = headings
      .map(({ id, text, level }) => `
        <a href="#${id}"
           class="sidebar-link ${level === 2 ? 'pl-2' : 'pl-4'} block py-1.5 text-slate-300 hover:text-blue-400 transition-colors duration-200 rounded relative"
           data-heading-link="${id}">
          ${decode(text)}
        </a>
      `)
      .join('');

    // Read template and replace content
    const template = await fs.readFile(
      path.join(process.cwd(), 'template.html'),
      'utf-8'
    );

    const finalHtml = template
      .replace(/\{\{\s*title\s*\}\}/g, title)
      .replace(/\{\{\s*description\s*\}\}/g, description)
      .replace(/\{\{\s*content\s*\}\}/g, contentHtml)
      .replace(/\{\{\s*sidebar\s*\}\}/g, sidebarHtml);

    await fs.writeFile(path.join(outDir, 'index.html'), finalHtml);
    console.log('Build completed successfully');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
