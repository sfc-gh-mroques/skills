#!/usr/bin/env python3
"""Look for leftovers of the reference film in the built page.

usage: python3 tools/residue.py [dist/film.html] [--words tools/reference_words.txt]

Proofreading tools only see what is on screen at the instants they are given. This one reads the whole built page
(code and styles, embedded images and fonts excluded) and reports every word of the reference film that is still there:
a forgotten label, a page title, a text painted on an in-world screen. Run it before publishing an adapted film.
"""
import re, sys

def main():
    args = sys.argv[1:]
    words_path = 'tools/reference_words.txt'
    if '--words' in args:
        i = args.index('--words'); words_path = args[i + 1]; del args[i:i + 2]
    page_path = args[0] if args else 'dist/film.html'
    page = open(page_path, encoding='utf8').read()
    page = page.replace('\\\n', '')                                # long strings are wrapped with backslash-newline
    page = re.sub(r'[A-Za-z0-9+/=]{120,}', ' ', page)              # embedded images and fonts (base64)
    words = [l.strip() for l in open(words_path, encoding='utf8') if l.strip() and not l.startswith('#')]
    found = 0
    for w in words:
        hits = [m.start() for m in re.finditer(r'(?<![A-Za-z0-9])' + re.escape(w) + r'(?![A-Za-z0-9])', page)]
        if not hits: continue
        found += 1
        ctx = page[max(0, hits[0] - 45):hits[0] + len(w) + 45].replace('\n', ' ')
        print(f'{len(hits):4d} x  {w:30s} e.g. ...{ctx}...')
    print(f'\n{found} of {len(words)} reference words are still in {page_path}.' + ('' if found else ' Clean.'))

if __name__ == '__main__':
    main()
